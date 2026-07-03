import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { useResumeStore } from '../store/resumeStore.js';
import {
  FileText,
  AlertTriangle,
  Loader,
  Cpu,
  Check,
  Download,
  Sparkles,
  RefreshCw,
  Briefcase,
  Copy,
  PlusCircle,
  ThumbsUp,
  XCircle,
  TrendingUp,
} from 'lucide-react';

const easeCurve = [0.16, 1, 0.3, 1] as const;

interface JobMatchResult {
  overallMatchScore: number;
  subScores: {
    skillsMatch: number;
    experienceMatch: number;
    projectMatch: number;
    educationMatch: number;
  };
  matchSummary: string;
  matchedSkills: string[];
  missingSkills: string[];
  matchedKeywords: string[];
  missingKeywords: string[];
  experienceAnalysis: string;
  educationAnalysis: string;
  projectAnalysis: string;
  atsCompatibility: string;
  resumeImprovements: string[];
  optimizedBulletPoints: string[];
  top10KeywordsToAdd: string[];
  hiringRecommendation: string;
  interviewProbability: 'High' | 'Medium' | 'Low';
  estimatedATSScoreAfterChanges: number;
}

export default function JobDescriptionMatcher() {
  const { resumeText, resumeFileName, setResumeData, clearResume } = useResumeStore();

  const [jobDescription, setJobDescription] = useState('');
  const [matching, setMatching] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
  // File upload state for fallback
  const [, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Uploading Resume...',
    'Extracting Text...',
    'Understanding Job Description...',
    'Comparing Skills...',
    'Generating AI Recommendations...',
    'Preparing Report...',
  ];

  // Show dynamic self-dismissing toasts
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

  // Step loader timer
  useEffect(() => {
    if (matching) {
      const stepDuration = 600;
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            setCompletedSteps((prevCompleted) => [...prevCompleted, prev]);
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setMatching(false);
            }, 500);
            return prev;
          }
        });
      }, stepDuration);
      return () => clearInterval(interval);
    }
  }, [matching, steps.length]);

  // Overall Score dial counter animation
  useEffect(() => {
    if (matchResult && !matching) {
      let currentVal = 0;
      const targetVal = matchResult.overallMatchScore;
      if (targetVal <= 0) {
        setAnimatedScore(0);
        return;
      }
      const stepTime = Math.abs(Math.floor(800 / targetVal));
      const timer = setInterval(() => {
        currentVal += 1;
        setAnimatedScore(currentVal);
        if (currentVal >= targetVal) {
          clearInterval(timer);
        }
      }, stepTime);
      return () => clearInterval(timer);
    } else {
      setAnimatedScore(0);
    }
  }, [matchResult, matching]);

  // Handle local fallback resume upload
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      setErrorMessage(null);

      if (selectedFile.size > 5 * 1024 * 1024) {
        setErrorMessage('File size exceeds the 5MB maximum limit.');
        return;
      }

      setFile(selectedFile);
      setUploadState('uploading');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('resume', selectedFile);

      try {
        const response = await axios.post('/api/resume/analyze', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            const total = progressEvent.total || selectedFile.size;
            const percentCompleted = Math.round((progressEvent.loaded * 100) / total);
            setUploadProgress(percentCompleted);
          },
        });

        if (response.data && response.data.success && response.data.data) {
          setUploadState('success');
          const extText = response.data.data.resumeText || '';
          setResumeData(extText, selectedFile.name, response.data.data);
        } else {
          throw new Error('API returned invalid format.');
        }
      } catch (err: any) {
        console.error('File parsing failure:', err);
        setUploadState('error');
        setErrorMessage(err.response?.data?.message || err.message || 'Parsing failed.');
      }
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  // Perform AI Match Analysis call
  const handleAnalyzeMatch = async () => {
    if (!resumeText || !jobDescription) return;

    setErrorMessage(null);
    setMatchResult(null);
    setMatching(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);

    try {
      console.log('Sending resume and JD for match comparison...');
      const response = await axios.post('/api/job/match', {
        resumeText,
        jobDescription,
      });

      console.log('Match JSON response:', response.data);

      if (response.data && response.data.success && response.data.data) {
        setMatchResult(response.data.data);
      } else {
        throw new Error('Invalid match result format from API.');
      }
    } catch (err: any) {
      console.error('Match connection failure:', err);
      setMatching(false);
      setErrorMessage(err.response?.data?.message || err.message || 'Matching failed.');
    }
  };

  const copyBulletPoints = () => {
    if (!matchResult || !matchResult.optimizedBulletPoints) return;
    const formattedBullets = matchResult.optimizedBulletPoints
      .map((b) => `- ${b}`)
      .join('\n');
    navigator.clipboard.writeText(formattedBullets);
    showToast('Optimized bullet points copied to clipboard!');
  };

  const resetMatcher = () => {
    setJobDescription('');
    setMatchResult(null);
    setUploadState('idle');
    setFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-650 text-xs font-bold text-white rounded-lg shadow-xl shadow-blue-500/10 flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-indigo-400" /> AI Job Description Matcher
          </h1>
          <p className="text-slate-550 text-xs">Compare your resume directly with a targeted job listing to identify critical keyword gaps.</p>
        </div>
        {matchResult && (
          <button
            onClick={resetMatcher}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
          >
            Match with Another JD
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!matching && !matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: easeCurve }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Input Form Column (Left) */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Job Description Textarea */}
              <div className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Paste Job Description</h3>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {jobDescription.length} characters
                  </span>
                </div>
                
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the SDE job listing description text here..."
                  className="w-full h-80 bg-slate-950/80 border border-slate-850 rounded-xl p-4 text-xs text-slate-300 placeholder-slate-600 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                />

                {errorMessage && (
                  <div className="p-3 bg-red-950/40 border border-red-900/60 rounded-xl flex gap-2 text-xs text-red-300">
                    <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleAnalyzeMatch}
                    disabled={!resumeText || jobDescription.trim().length < 20}
                    className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-650 hover:from-blue-700 hover:to-indigo-755 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-white shadow-xl shadow-blue-500/10 transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> Analyze Job Match
                  </button>
                </div>
              </div>

            </div>

            {/* Resume Upload Status Column (Right) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-slate-900/10 border border-slate-850 rounded-2xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" /> Resume Target Source
                </h3>

                {resumeFileName ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-955/60 border border-slate-900 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="w-5 h-5 text-green-400" />
                        <div>
                          <span className="text-white font-semibold block truncate max-w-[160px]">{resumeFileName}</span>
                          <span className="text-[10px] text-slate-500 block">Preloaded from previous scan</span>
                        </div>
                      </div>
                      <button
                        onClick={clearResume}
                        className="text-[10px] font-bold text-red-400 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-550 leading-relaxed italic bg-slate-950/20 p-3 rounded-lg border border-slate-900">
                      The analyzer will compare this preloaded resume against the JD. If you wish to use a different profile, click "Remove" and upload a new file.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      onClick={triggerFilePicker}
                      className="p-8 border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/30 hover:bg-slate-950/50 rounded-xl text-center cursor-pointer flex flex-col items-center justify-center space-y-3 transition-colors"
                    >
                      <UploadIcon className="w-6 h-6 text-slate-500" />
                      <span className="text-xs text-slate-400">Click to upload a resume file (PDF/DOCX)</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                    />

                    {uploadState === 'uploading' && (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-400 flex items-center gap-1">
                            <Loader className="w-3.5 h-3.5 animate-spin text-blue-500" /> Parsing resume...
                          </span>
                          <span className="text-slate-400">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden">
                          <div className="h-full bg-blue-500 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

          </motion.div>
        )}

        {/* Step Loader Overlay */}
        {matching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070a13] flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <Cpu className="mx-auto h-10 w-10 text-indigo-400 animate-pulse" />
                <h3 className="text-base font-bold text-white tracking-wide uppercase">AI JD Comparative Scan</h3>
                <p className="text-xs text-slate-500">Cross-referencing candidate profile matrices with requested keywords.</p>
              </div>

              {/* Progress workflow list */}
              <div className="space-y-4">
                {steps.map((step, idx) => {
                  const isCompleted = completedSteps.includes(idx);
                  const isActive = idx === currentStepIndex;

                  return (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: isCompleted || isActive ? 1 : 0.25,
                        x: 0,
                      }}
                      transition={{ duration: 0.4 }}
                      className="flex items-center gap-3 text-xs"
                    >
                      <div className="flex-shrink-0">
                        {isCompleted ? (
                          <div className="h-5 w-5 rounded-full bg-green-950/60 border border-green-800 flex items-center justify-center">
                            <Check className="h-3 w-3 text-green-400" />
                          </div>
                        ) : isActive ? (
                          <Loader className="animate-spin h-5 w-5 text-indigo-500" />
                        ) : (
                          <div className="h-5 w-5 rounded-full border border-slate-900 bg-slate-950" />
                        )}
                      </div>
                      <span className={`font-medium ${isActive ? 'text-white font-semibold' : 'text-slate-400'}`}>
                        {step}
                      </span>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Comparative scorecard report */}
        {!matching && matchResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="space-y-6 animate-fade-in"
          >
            {/* Top Score Dial & breakdown gauges */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Dial Score */}
              <div className="md:col-span-2 p-6 bg-slate-900/20 border border-slate-800/80 rounded-2xl flex flex-col items-center justify-center text-center space-y-4 shadow-xl">
                <span className="text-xs font-bold text-slate-350 uppercase tracking-wider block">Overall suitability Match</span>
                
                <div className="relative h-28 w-28 flex items-center justify-center bg-slate-950 border border-slate-900 rounded-full shadow-inner">
                  <span className="text-3xl font-extrabold text-indigo-400 font-mono">{animatedScore}%</span>
                  <div className="absolute inset-2 rounded-full border-2 border-indigo-500/10 border-t-indigo-400" />
                </div>

                <div className="text-center">
                  <span className="text-[10px] text-slate-500 block">Interview Probability:</span>
                  <span className={`text-xs font-bold ${
                    matchResult.interviewProbability === 'High' ? 'text-green-400' : matchResult.interviewProbability === 'Medium' ? 'text-yellow-400' : 'text-red-400'
                  }`}>
                    {matchResult.interviewProbability} Probability
                  </span>
                </div>
              </div>

              {/* Gauges breakdown grid */}
              <div className="md:col-span-3 p-6 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recruiter Breakdown Score</h3>
                  <p className="text-[10px] text-slate-500 mt-1">{matchResult.matchSummary}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-6">
                  {[
                    { label: 'Skills Match', score: matchResult.subScores.skillsMatch, color: 'bg-emerald-500', text: 'text-emerald-400' },
                    { label: 'Experience Match', score: matchResult.subScores.experienceMatch, color: 'bg-indigo-500', text: 'text-indigo-400' },
                    { label: 'Project Match', score: matchResult.subScores.projectMatch, color: 'bg-green-500', text: 'text-green-400' },
                    { label: 'Education Match', score: matchResult.subScores.educationMatch, color: 'bg-blue-500', text: 'text-blue-400' },
                  ].map((sub, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px] font-semibold text-slate-400">
                        <span>{sub.label}</span>
                        <span className={sub.text}>{sub.score}%</span>
                      </div>
                      <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                        <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* Keyword Comparisons and Recommendations lists */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Keywords Match List */}
              <div className="lg:col-span-2 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">JD Keywords Matches</h3>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {(matchResult.matchedKeywords || []).map((k, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-slate-955/40 border border-slate-900 rounded-lg text-xs">
                      <span className="font-semibold text-slate-300">{k}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-green-950/40 border border-green-900/40 text-green-400">Matched</span>
                    </div>
                  ))}
                  {(matchResult.missingKeywords || []).map((k, i) => (
                    <div key={i} className="flex justify-between items-center p-2.5 bg-slate-955/40 border border-slate-900 rounded-lg text-xs">
                      <span className="font-semibold text-slate-300">{k}</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase bg-red-950/40 border border-red-900/40 text-red-400">Missing</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Keywords to add */}
              <div className="lg:col-span-3 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> Top 10 Keywords To Add
                </h3>
                
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  Integrate these matching industry phrases directly into your resume summaries and descriptions to align with ATS filters.
                </p>

                <div className="flex flex-wrap gap-2">
                  {(matchResult.top10KeywordsToAdd || []).map((k, idx) => (
                    <span key={idx} className="text-xs font-semibold px-3 py-1 bg-slate-950 border border-slate-850 hover:border-slate-800 text-slate-300 rounded-lg flex items-center gap-1">
                      <PlusCircle className="w-3.5 h-3.5 text-blue-450" /> {k}
                    </span>
                  ))}
                </div>
              </div>

            </div>

            {/* Skills Compare Section */}
            <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Required Skills Analysis</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Matched Skills */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-green-400 font-bold uppercase tracking-wide flex items-center gap-1">
                    <ThumbsUp className="w-3.5 h-3.5" /> Matched Skills
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(matchResult.matchedSkills || []).map((s, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-green-950/40 border border-green-900/50 text-green-400 rounded-lg">
                        {s}
                      </span>
                    ))}
                    {(matchResult.matchedSkills || []).length === 0 && (
                      <span className="text-xs text-slate-550 italic">None identified.</span>
                    )}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="space-y-2.5">
                  <span className="text-[10px] text-red-400 font-bold uppercase tracking-wide flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> Missing Skills
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {(matchResult.missingSkills || []).map((s, idx) => (
                      <span key={idx} className="text-xs font-semibold px-2.5 py-1 bg-red-955/40 border border-red-900/50 text-red-400 rounded-lg">
                        {s}
                      </span>
                    ))}
                    {(matchResult.missingSkills || []).length === 0 && (
                      <span className="text-xs text-slate-550 italic">No missing skills detected!</span>
                    )}
                  </div>
                </div>

              </div>
            </div>

            {/* Critique Panels (Experience, Projects, Education, formatting) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Experience Analysis</span>
                <p className="text-xs text-slate-400 leading-relaxed">{matchResult.experienceAnalysis}</p>
              </div>

              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Project Analysis</span>
                <p className="text-xs text-slate-400 leading-relaxed">{matchResult.projectAnalysis}</p>
              </div>

              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-2">
                <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide">Education & Formatting</span>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {matchResult.educationAnalysis} <br className="my-2" />
                  <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wide block mt-2">ATS Compatibility:</span>
                  {matchResult.atsCompatibility}
                </p>
              </div>

            </div>

            {/* Improvements and refactors */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Optimization suggestions list */}
              <div className="lg:col-span-2 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Suggested improvements</h3>
                <ul className="space-y-3 pl-4 text-xs text-slate-450 list-disc list-inside">
                  {(matchResult.resumeImprovements || []).map((imp, idx) => (
                    <li key={idx} className="marker:text-blue-500">{imp}</li>
                  ))}
                </ul>
              </div>

              {/* Optimized bullet points refactor */}
              <div className="lg:col-span-3 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-green-400" /> Optimized SDE Bullet Points
                  </h3>
                  <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                    Google-style STAR description sentences matching SDE tasks in the pasted Job Description. Copy and use these bullet points directly in your project profiles.
                  </p>
                </div>

                <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
                  {(matchResult.optimizedBulletPoints || []).map((bp, idx) => (
                    <div key={idx} className="p-3.5 bg-blue-955/15 border border-blue-900/35 rounded-xl text-slate-300 text-xs font-medium italic leading-relaxed">
                      "{bp}"
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    onClick={copyBulletPoints}
                    className="w-full py-2.5 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-bold text-slate-350 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Copy className="w-3.5 h-3.5 text-blue-450" /> Copy Optimized Bullet Points
                  </button>
                </div>
              </div>

            </div>

            {/* Hiring Recommendation banner */}
            <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-950/60 border border-indigo-800 flex items-center justify-center text-indigo-400 flex-shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs space-y-0.5">
                <span className="font-bold text-slate-250 block">Hiring recommendation</span>
                <p className="text-slate-450 leading-relaxed">{matchResult.hiringRecommendation}</p>
              </div>
            </div>

            {/* Action Buttons panel */}
            <div className="p-4 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-wrap gap-4 items-center justify-between">
              
              {/* Score Estimate display */}
              <div className="text-xs">
                <span className="text-slate-500 block">Estimated ATS Score After Changes:</span>
                <span className="font-extrabold text-green-400 font-mono text-sm">
                  {matchResult.estimatedATSScoreAfterChanges}% Score
                </span>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => showToast('Coming in Next Milestone')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white transition-all shadow-md shadow-blue-500/10"
                >
                  <Download className="w-3.5 h-3.5" /> Generate Optimized Resume
                </button>
                <button
                  onClick={resetMatcher}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-350 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Match with Another JD
                </button>
              </div>

            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

// Minimal internal helper icons
function UploadIcon(props: any) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" x2="12" y1="3" y2="15" />
    </svg>
  );
}
