/**
 * Constants for user profile fields
 */

// Valid gender values
const VALID_GENDERS = ['male', 'female', 'non-binary', 'other', ''];

// Valid sexual orientation values
const VALID_SEXUAL_ORIENTATIONS = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other', ''];

// Valid gender preference values (includes 'any' for matching)
const VALID_GENDER_PREFERENCES = ['male', 'female', 'non-binary', 'other', 'any'];

// Valid sexual orientation preference values (includes 'any' for matching)
const VALID_SEXUAL_ORIENTATION_PREFERENCES = ['straight', 'gay', 'lesbian', 'bisexual', 'pansexual', 'asexual', 'other', 'any'];

module.exports = {
  VALID_GENDERS,
  VALID_SEXUAL_ORIENTATIONS,
  VALID_GENDER_PREFERENCES,
  VALID_SEXUAL_ORIENTATION_PREFERENCES
};
