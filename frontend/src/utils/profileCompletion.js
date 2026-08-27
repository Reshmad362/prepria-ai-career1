/**
 * Canonical PREPRIA Profile Completion Calculator
 * Single source of truth across Dashboard, My Profile, Onboarding, and Settings.
 */

export function calculateProfileCompletion(profile, preferences, user) {
  const activeEmail = user?.email || profile?.email || localStorage.getItem('activeUser') || localStorage.getItem('userEmail');
  
  let storedAtsData = null;
  if (activeEmail) {
    try {
      const rawAts = localStorage.getItem(`atsData_${activeEmail}`);
      if (rawAts) storedAtsData = JSON.parse(rawAts);
    } catch(e) {}
  }

  const hasResumeAnalyzed = Boolean(
    profile?.resumeUploaded === true || 
    Boolean(profile?.resumeFileName) ||
    Boolean(profile?.score !== undefined && profile?.score !== null) ||
    Boolean(profile?.skills && Array.isArray(profile.skills) && profile.skills.length > 0) ||
    Boolean(storedAtsData && (storedAtsData.score !== undefined || (storedAtsData.skills && storedAtsData.skills.length > 0) || storedAtsData.fileName))
  );

  const atsScore = profile?.score !== undefined && profile?.score !== null 
    ? profile.score 
    : (storedAtsData?.score !== undefined ? storedAtsData.score : null);

  const sections = [
    {
      id: 'name',
      label: 'Full Name',
      desc: 'Your candidate full name',
      isComplete: Boolean((profile?.name && profile.name.trim() !== '' && profile.name !== 'Not found') || (user?.name && user.name.trim() !== '')),
      actionText: 'Add Name →',
      actionRoute: 'edit'
    },
    {
      id: 'email',
      label: 'Email Address',
      desc: 'Account email verification',
      isComplete: Boolean(activeEmail && activeEmail.trim() !== ''),
      actionText: 'Verify Email →',
      actionRoute: 'edit'
    },
    {
      id: 'phone',
      label: 'Phone Number',
      desc: 'Contact phone number',
      isComplete: Boolean(profile?.phone && profile.phone.trim() !== '' && profile.phone !== 'Not found'),
      actionText: 'Add Phone →',
      actionRoute: 'edit'
    },
    {
      id: 'gender',
      label: 'Gender',
      desc: 'Gender identity',
      isComplete: Boolean(profile?.gender && profile.gender !== 'Select Gender' && profile.gender.trim() !== ''),
      actionText: 'Select Gender →',
      actionRoute: 'edit'
    },
    {
      id: 'city',
      label: 'City / Location',
      desc: 'Your current location',
      isComplete: Boolean(profile?.city && profile.city.trim() !== ''),
      actionText: 'Set Location →',
      actionRoute: 'edit'
    },
    {
      id: 'targetRole',
      label: 'Target Role',
      desc: 'Your primary desired job role',
      isComplete: Boolean((preferences?.targetRole && preferences.targetRole.trim() !== '') || (profile?.targetRole && profile.targetRole.trim() !== '')),
      actionText: 'Set Role →',
      actionRoute: 'edit'
    },
    {
      id: 'techStack',
      label: 'Tech Stack',
      desc: 'Core languages and frameworks',
      isComplete: Boolean(preferences?.techStack && preferences.techStack.trim() !== ''),
      actionText: 'Add Tech Stack →',
      actionRoute: 'edit'
    },
    {
      id: 'careerGoals',
      label: 'Career Goals',
      desc: 'Short & long-term career ambition',
      isComplete: Boolean(preferences?.careerGoals && preferences.careerGoals.trim() !== ''),
      actionText: 'Define Goals →',
      actionRoute: 'edit'
    },
    {
      id: 'workPreference',
      label: 'Work Preference',
      desc: 'Remote, hybrid, or on-site preference',
      isComplete: Boolean(preferences?.workPreference && preferences.workPreference.trim() !== ''),
      actionText: 'Set Preference →',
      actionRoute: 'edit'
    },
    {
      id: 'resume',
      label: 'Resume Upload',
      desc: 'ATS scan & skill intelligence',
      isComplete: hasResumeAnalyzed,
      actionText: 'Upload Resume →',
      actionRoute: '/resume-upload'
    }
  ];

  const completedSections = sections.filter(s => s.isComplete);
  const missingSections = sections.filter(s => !s.isComplete);
  const missingLabels = missingSections.map(s => s.label);

  const completedCount = completedSections.length;
  const totalCount = sections.length;
  const percentage = Math.round((completedCount / totalCount) * 100);
  const remainingCount = totalCount - completedCount;

  let status = "Getting Started";
  let color = "text-amber-500";
  let barColor = "bg-amber-500";

  if (percentage >= 100) {
    status = "Career Ready";
    color = "text-emerald-500";
    barColor = "bg-emerald-500";
  } else if (percentage >= 90) {
    status = "Almost Complete";
    color = "text-[#FF6B00]";
    barColor = "bg-[#FF6B00]";
  } else if (percentage >= 70) {
    status = "Strong Profile";
    color = "text-[#FF6B00]";
    barColor = "bg-[#FF6B00]";
  } else if (percentage >= 40) {
    status = "Building Profile";
    color = "text-[#FF6B00]";
    barColor = "bg-[#FF6B00]";
  }

  const resumeStatus = {
    isUploaded: hasResumeAnalyzed,
    isAnalyzed: hasResumeAnalyzed && atsScore !== null,
    score: atsScore,
    fileName: profile?.resumeFileName || storedAtsData?.fileName || (hasResumeAnalyzed ? 'Resume Analyzed' : null)
  };

  return {
    percentage,
    completed: completedCount,
    total: totalCount,
    remaining: remainingCount,
    missing: missingLabels,
    missingSections,
    completedSections,
    sections,
    status,
    color,
    barColor,
    resumeStatus
  };
}
