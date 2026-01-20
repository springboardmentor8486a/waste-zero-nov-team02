const User = require('../models/User');
const VolunteerProfile = require('../models/VolunteerProfile');
const Opportunity = require('../models/Opportunity');
const Application = require('../models/Application');

/**
 * Calculate geographic distance between two locations (simple string matching for now)
 * In production, use geocoding API to convert addresses to lat/lng and calculate real distance
 */
function calculateLocationScore(volunteerLocation, opportunityLocation) {
  if (!volunteerLocation || !opportunityLocation) {
    return 0.3; // Default score if location is missing
  }

  const volLoc = volunteerLocation.toLowerCase().trim();
  const oppLoc = opportunityLocation.toLowerCase().trim();

  // Exact match
  if (volLoc === oppLoc) {
    return 1.0;
  }

  // Check if same city (extract city from address)
  const volCity = volLoc.split(',')[0].trim();
  const oppCity = oppLoc.split(',')[0].trim();
  if (volCity === oppCity) {
    return 0.8;
  }

  // Check if same state/region (second part of address)
  const volParts = volLoc.split(',');
  const oppParts = oppLoc.split(',');
  if (volParts.length > 1 && oppParts.length > 1) {
    const volState = volParts[1].trim();
    const oppState = oppParts[1].trim();
    if (volState === oppState) {
      return 0.5;
    }
  }

  // Partial match (contains)
  if (volLoc.includes(oppLoc) || oppLoc.includes(volLoc)) {
    return 0.6;
  }

  return 0.2; // Different locations
}

/**
 * Calculate skills match score
 */
function calculateSkillsScore(volunteerSkills, requiredSkills) {
  if (!requiredSkills || requiredSkills.length === 0) {
    return 0.5; // No required skills = neutral score
  }

  if (!volunteerSkills || volunteerSkills.length === 0) {
    return 0; // No volunteer skills = no match
  }

  const volSkillsLower = volunteerSkills.map(s => s.toLowerCase().trim());
  const reqSkillsLower = requiredSkills.map(s => s.toLowerCase().trim());

  let matchedCount = 0;
  reqSkillsLower.forEach(reqSkill => {
    if (volSkillsLower.some(volSkill => 
      volSkill === reqSkill || 
      volSkill.includes(reqSkill) || 
      reqSkill.includes(volSkill)
    )) {
      matchedCount++;
    }
  });

  return matchedCount / requiredSkills.length; // Percentage of required skills matched
}

/**
 * Calculate overall match score
 * @param {Object} volunteer - Volunteer user object
 * @param {Object} volunteerProfile - VolunteerProfile object
 * @param {Object} opportunity - Opportunity object
 * @returns {Number} Match score between 0 and 1
 */
function calculateMatchScore(volunteer, volunteerProfile, opportunity) {
  // Get skills from volunteer profile or user
  const volunteerSkills = volunteerProfile?.skills || volunteer?.skills || [];
  const requiredSkills = opportunity.required_skills || [];

  // Get locations
  const volunteerLocation = volunteerProfile?.city || volunteerProfile?.address || volunteer?.location || '';
  const opportunityLocation = opportunity.location || '';

  // Calculate component scores
  const skillsScore = calculateSkillsScore(volunteerSkills, requiredSkills);
  const locationScore = calculateLocationScore(volunteerLocation, opportunityLocation);

  // Weighted combination (skills 70%, location 30%)
  const overallScore = (skillsScore * 0.7) + (locationScore * 0.3);

  return {
    overallScore,
    skillsScore,
    locationScore,
    matchedSkills: volunteerSkills.filter(vs => 
      requiredSkills.some(rs => 
        vs.toLowerCase().trim() === rs.toLowerCase().trim() ||
        vs.toLowerCase().includes(rs.toLowerCase()) ||
        rs.toLowerCase().includes(vs.toLowerCase())
      )
    )
  };
}

/**
 * Find matches for a volunteer
 * @param {String} volunteerId - Volunteer user ID
 * @returns {Array} Array of matched opportunities with scores
 */
async function findMatchesForVolunteer(volunteerId) {
  try {
    const volunteer = await User.findById(volunteerId);
    if (!volunteer || volunteer.role !== 'volunteer') {
      throw new Error('Invalid volunteer');
    }

    const volunteerProfile = await VolunteerProfile.findOne({ user: volunteerId });
    
    // Get all open opportunities
    const opportunities = await Opportunity.find({ status: 'open' })
      .populate('ngo_id', 'username fullName email')
      .lean();

    // Calculate matches
    const matches = [];
    for (const opp of opportunities) {
      // Check if volunteer already applied
      const existingApplication = await Application.findOne({
        volunteer_id: volunteerId,
        opportunity_id: opp._id
      });

      if (existingApplication) {
        continue; // Skip if already applied
      }

      const matchData = calculateMatchScore(volunteer, volunteerProfile, opp);
      
      // Only include matches above threshold (0.3)
      if (matchData.overallScore >= 0.3) {
        matches.push({
          opportunity: opp,
          score: matchData.overallScore,
          skillsScore: matchData.skillsScore,
          locationScore: matchData.locationScore,
          matchedSkills: matchData.matchedSkills
        });
      }
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  } catch (error) {
    console.error('Error finding matches for volunteer:', error);
    throw error;
  }
}

/**
 * Find matches for an opportunity (eligible volunteers)
 * @param {String} opportunityId - Opportunity ID
 * @param {String} ngoId - NGO user ID (for ownership validation)
 * @returns {Array} Array of matched volunteers with scores
 */
async function findMatchesForOpportunity(opportunityId, ngoId) {
  try {
    const opportunity = await Opportunity.findById(opportunityId);
    if (!opportunity) {
      throw new Error('Opportunity not found');
    }

    // Verify ownership
    if (opportunity.ngo_id && opportunity.ngo_id.toString() !== ngoId.toString()) {
      throw new Error('Unauthorized: You do not own this opportunity');
    }

    // Get all volunteers
    const volunteers = await User.find({ role: 'volunteer', isBlocked: false })
      .select('-password')
      .lean();

    const matches = [];
    const requiredSkills = opportunity.required_skills || [];

    for (const volunteer of volunteers) {
      const volunteerProfile = await VolunteerProfile.findOne({ user: volunteer._id }).lean();

      // Check if volunteer already applied
      const existingApplication = await Application.findOne({
        volunteer_id: volunteer._id,
        opportunity_id: opportunityId
      });

      if (existingApplication) {
        continue; // Skip if already applied
      }

      const matchData = calculateMatchScore(volunteer, volunteerProfile, opportunity);

      // Only include matches above threshold (0.3)
      if (matchData.overallScore >= 0.3) {
        matches.push({
          volunteer: {
            id: volunteer._id,
            username: volunteer.username,
            fullName: volunteer.fullName,
            email: volunteer.email,
            location: volunteerProfile?.city || volunteerProfile?.address || volunteer.location,
            skills: volunteerProfile?.skills || volunteer.skills || [],
            avatar: volunteerProfile?.avatar || volunteer.avatar
          },
          score: matchData.overallScore,
          skillsScore: matchData.skillsScore,
          locationScore: matchData.locationScore,
          matchedSkills: matchData.matchedSkills
        });
      }
    }

    // Sort by score (highest first)
    matches.sort((a, b) => b.score - a.score);

    return matches;
  } catch (error) {
    console.error('Error finding matches for opportunity:', error);
    throw error;
  }
}

module.exports = {
  calculateMatchScore,
  findMatchesForVolunteer,
  findMatchesForOpportunity,
  calculateLocationScore,
  calculateSkillsScore
};

