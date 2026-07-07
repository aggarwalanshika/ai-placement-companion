import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
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
  TrendingUp,
} from 'lucide-react';
import { api } from '../services/api.ts';

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

interface SkillGraphProps {
  matched: string[];
  missing: string[];
  showToast: (msg: string) => void;
}

export function InteractiveSkillGraph({ matched, missing, showToast }: SkillGraphProps) {
  const [nodes, setNodes] = useState<any[]>([]);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [time, setTime] = useState(0);

  useEffect(() => {
    const list: any[] = [];
    const allKeywords = [
      ...matched.map(name => ({ name, type: 'matched' as const })),
      ...missing.map(name => ({ name, type: 'missing' as const }))
    ].slice(0, 16); 

    allKeywords.forEach((item, idx) => {
      const angle = (idx * 2 * Math.PI) / allKeywords.length;
      const radius = item.type === 'matched' ? 115 + (idx % 2) * 15 : 155 + (idx % 2) * 15;
      
      const advice = item.type === 'matched'
        ? `Validated in profile: matching target requirements. Ready to discuss implementation architectural metrics during technical SDE review.`
        : `Critical Skill Gap: Add to your experience section by explaining quantified SDE outcomes (e.g. latency reduced by 15% using ${item.name} caching).`;

      list.push({
        id: `node-${idx}`,
        name: item.name,
        type: item.type,
        angle,
        radius,
        phase: Math.random() * Math.PI * 2,
        speed: 0.8 + Math.random() * 0.4,
        advice
      });
    });

    setNodes(list);
  }, [matched, missing]);

  useEffect(() => {
    let animId: number;
    const update = () => {
      setTime((t) => t + 0.012);
      animId = requestAnimationFrame(update);
    };
    animId = requestAnimationFrame(update);
    return () => cancelAnimationFrame(animId);
  }, []);

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
      <div>
        <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-blue-600 animate-pulse" /> SDE Skill Alignment Map
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5">Interactive visual blueprint of your skills matching targeted JD anchors. Hover or click nodes to check AI suggestions.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
        
        {/* SVG Viewport */}
        <div className="lg:col-span-3 h-[420px] bg-slate-50 border border-slate-200 rounded-2xl overflow-hidden relative shadow-inner flex items-center justify-center">
          
          {/* Blueprint Dot Pattern background */}
          <div className="absolute inset-0 opacity-20 pointer-events-none" style={{
            backgroundImage: 'radial-gradient(#94a3b8 1.5px, transparent 1.5px)',
            backgroundSize: '16px 16px'
          }} />

          <svg className="w-full h-full" viewBox="0 0 500 420">
            <defs>
              <filter id="node-glow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="3" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Grid Crosshair anchor in center */}
            <line x1="250" y1="40" x2="250" y2="380" stroke="#e2e8f0" strokeDasharray="3 3" />
            <line x1="50" y1="210" x2="450" y2="210" stroke="#e2e8f0" strokeDasharray="3 3" />

            {/* Connecting lines */}
            {nodes.map((node) => {
              const ox = Math.cos(time * node.speed + node.phase) * 8;
              const oy = Math.sin(time * node.speed + node.phase) * 8;
              const nx = 250 + Math.cos(node.angle) * node.radius + ox;
              const ny = 210 + Math.sin(node.angle) * node.radius + oy;

              const isMatched = node.type === 'matched';
              return (
                <line
                  key={`line-${node.id}`}
                  x1="250"
                  y1="210"
                  x2={nx}
                  y2={ny}
                  stroke={isMatched ? '#10b981' : '#f43f5e'}
                  strokeWidth={isMatched ? '1.5' : '1'}
                  strokeDasharray={isMatched ? 'none' : '3 3'}
                  opacity={selectedNode?.id === node.id ? 1 : 0.3}
                  className="transition-opacity duration-300"
                />
              );
            })}

            {/* Center target role hub */}
            <circle cx="250" cy="210" r="24" fill="#eff6ff" stroke="#2563eb" strokeWidth="2.5" />
            <circle cx="250" cy="210" r="6" fill="#2563eb" />
            <text x="250" y="248" textAnchor="middle" className="text-[8.5px] font-sans font-bold fill-slate-800 uppercase tracking-wider">Target JD</text>

            {/* Floating skill nodes */}
            {nodes.map((node) => {
              const ox = Math.cos(time * node.speed + node.phase) * 8;
              const oy = Math.sin(time * node.speed + node.phase) * 8;
              const nx = 250 + Math.cos(node.angle) * node.radius + ox;
              const ny = 210 + Math.sin(node.angle) * node.radius + oy;

              const isSelected = selectedNode?.id === node.id;
              const isMatched = node.type === 'matched';

              return (
                <g
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  className="cursor-pointer group"
                >
                  <circle
                    cx={nx}
                    cy={ny}
                    r="16"
                    fill="transparent"
                    stroke={isSelected ? '#3b82f6' : 'transparent'}
                    strokeWidth="2"
                    className="transition-all duration-300"
                  />

                  <circle
                    cx={nx}
                    cy={ny}
                    r="10"
                    fill="white"
                    stroke={isMatched ? '#10b981' : '#f43f5e'}
                    strokeWidth="2"
                    filter={isSelected ? 'url(#node-glow)' : 'none'}
                    className="group-hover:scale-110 transition-transform duration-300"
                  />

                  <circle
                    cx={nx}
                    cy={ny}
                    r="3.5"
                    fill={isMatched ? '#10b981' : '#f43f5e'}
                  />

                  <text
                    x={nx}
                    y={ny + 24}
                    textAnchor="middle"
                    className={`text-[8px] font-sans font-semibold tracking-wide uppercase transition-colors duration-200 ${
                      isSelected ? 'fill-blue-600 font-extrabold' : 'fill-slate-600 group-hover:fill-slate-900'
                    }`}
                  >
                    {node.name}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Dynamic Detail Card Sidebar */}
        <div className="lg:col-span-2 space-y-4">
          {selectedNode ? (
            <div className="p-5 border border-slate-200 bg-white rounded-2xl shadow-xs space-y-3.5 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                <span className="font-bold text-slate-900 text-sm uppercase tracking-wide">
                  {selectedNode.name}
                </span>
                <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${
                  selectedNode.type === 'matched' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-750 border border-red-200'
                }`}>
                  {selectedNode.type}
                </span>
              </div>

              <div>
                <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">ATS Recommendation Details</span>
                <p className="text-slate-700 leading-relaxed font-medium">
                  {selectedNode.advice}
                </p>
              </div>

              <div className="pt-2 border-t border-slate-100 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(selectedNode.name);
                    showToast(`Copied ${selectedNode.name}!`);
                  }}
                  className="px-3 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-[10px] font-bold text-slate-700 transition-colors"
                >
                  Copy Keyword
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 border border-slate-200 bg-slate-50/50 rounded-2xl text-center space-y-3 text-xs text-slate-500 italic h-[250px] flex flex-col justify-center items-center shadow-inner">
              <Briefcase className="w-8 h-8 text-slate-400 animate-bounce" />
              <div>
                <h4 className="font-bold text-slate-800 uppercase not-italic text-[10px] tracking-wider">Explore the Graph</h4>
                <p className="mt-1">Click on any floating skill node inside the blueprint mapping dashboard to evaluate AI advice details.</p>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function JobDescriptionMatcher() {
  const navigate = useNavigate();
  const { resumeText, resumeFileName, setResumeData, clearResume } = useResumeStore();

  const [jobDescription, setJobDescription] = useState('');
  const [matching, setMatching] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [matchResult, setMatchResult] = useState<JobMatchResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3000);
  };

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
          setAnimatedScore(targetVal);
        }
      }, stepTime);
      return () => clearInterval(timer);
    }
  }, [matchResult, matching]);

  const handleAnalyzeMatch = async () => {
    if (!resumeText) return;
    setMatching(true);
    setCurrentStepIndex(0);
    setCompletedSteps([]);
    setErrorMessage(null);

    try {
      const response = await api.post('/job/match', {
        resumeText,
        jobDescription,
      });

      if (response.data && response.data.success) {
        setMatchResult(response.data.data);
      } else {
        throw new Error('API request failed');
      }
    } catch (err: any) {
      setMatching(false);
      setErrorMessage(err.response?.data?.message || 'Matching analysis failed. Please verify API configurations.');
    }
  };

  const handleUploadResumeFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setUploadState('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p < 100) return p + 10;
        clearInterval(interval);
        return 100;
      });
    }, 100);

    try {
      const formData = new FormData();
      formData.append('resume', selectedFile);

      const response = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(interval);
      setUploadProgress(100);
      setUploadState('success');
      setResumeData(response.data.data.resumeText || '', selectedFile.name, response.data.data);
      showToast('Resume parsed successfully.');
    } catch (err: any) {
      clearInterval(interval);
      setUploadState('error');
      setErrorMessage(err.response?.data?.message || 'Failed to parse resume upload.');
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleUploadResumeFile(e.target.files[0]);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied to clipboard!');
  };

  const resetMatcher = () => {
    setMatchResult(null);
    setJobDescription('');
    setAnimatedScore(0);
    setUploadState('idle');
    setFile(null);
    setErrorMessage(null);
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 select-none">
      
      {/* Toast Alert System */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-4 py-2.5 bg-blue-600 text-xs font-bold text-white rounded-lg shadow-xl flex items-center gap-1.5 border border-blue-500"
          >
            <Sparkles className="w-4 h-4 text-yellow-300" /> {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-1.5">
            <Briefcase className="w-5 h-5 text-indigo-600" /> AI Job Description Matcher
          </h1>
          <p className="text-slate-550 text-xs">Compare your resume directly with a targeted job listing to identify critical keyword gaps.</p>
        </div>
        {matchResult && (
          <button
            onClick={resetMatcher}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all shadow-xs"
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
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-xs">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">Paste Job Description</h3>
                  <span className="text-[10px] text-slate-400 font-mono">
                    {jobDescription.length} characters
                  </span>
                </div>
                
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the SDE job listing description text here..."
                  className="w-full h-80 bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs text-slate-900 placeholder-slate-450 focus:outline-none focus:border-indigo-500 transition-colors resize-none leading-relaxed"
                />

                {errorMessage && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex gap-2 text-xs text-red-600">
                    <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                <div className="pt-2">
                  <button
                    onClick={handleAnalyzeMatch}
                    disabled={!resumeText || jobDescription.trim().length < 20}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-xs font-bold rounded-xl text-white shadow-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-4 h-4 text-yellow-300 animate-pulse" /> Analyze Job Match
                  </button>
                </div>
              </div>

            </div>

            {/* Resume Upload Status Column (Right) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-white border border-slate-200 rounded-2xl space-y-4 shadow-xs">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" /> Resume Target Source
                </h3>

                {resumeFileName ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                      <div className="flex items-center gap-2 text-xs">
                        <FileText className="w-5 h-5 text-green-500" />
                        <div>
                          <span className="text-slate-800 font-semibold block truncate max-w-[160px]">{resumeFileName}</span>
                          <span className="text-[10px] text-slate-500 block">Preloaded from previous scan</span>
                        </div>
                      </div>
                      <button
                        onClick={clearResume}
                        className="text-[10px] font-bold text-red-550 hover:underline"
                      >
                        Remove
                      </button>
                    </div>

                    <div className="text-[10px] text-slate-500 leading-relaxed italic bg-slate-50 p-3 rounded-lg border border-slate-200">
                      The analyzer will compare this preloaded resume against the JD. If you wish to use a different profile, click "Remove" and upload a new file.
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div
                      onClick={triggerFilePicker}
                      className="p-8 border-2 border-dashed border-slate-250 hover:border-slate-350 bg-white rounded-xl text-center cursor-pointer flex flex-col items-center justify-center space-y-3 transition-colors"
                    >
                      <FileText className="w-6 h-6 text-slate-400" />
                      <span className="text-xs text-slate-550 font-medium">Click to upload a resume file (PDF/DOCX)</span>
                    </div>

                    <input
                      ref={fileInputRef}
                      type="file"
                      className="hidden"
                      accept=".pdf,.docx"
                      onChange={handleFileChange}
                    />

                    {uploadState === 'uploading' && (
                      <div className="w-full space-y-2 pt-2">
                        <div className="flex justify-between items-center text-[10px] text-slate-500">
                          <span className="font-semibold flex items-center gap-1">
                            <Loader className="animate-spin w-3 h-3 text-blue-600" /> Uploading file...
                          </span>
                          <span className="font-mono">{uploadProgress}%</span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all duration-300"
                            style={{ width: `${uploadProgress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 2: Analyzer full-screen loader */}
        {matching && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <Cpu className="mx-auto h-10 w-10 text-blue-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-800 tracking-wide uppercase">AI Cross-Matching Core</h3>
                <p className="text-xs text-slate-550">Mapping profiles against target SDE parameters...</p>
              </div>

              <div className="space-y-4 bg-white border border-slate-200 p-6 rounded-2xl shadow-xl">
                {steps.map((stepMsg, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isCompleted = completedSteps.includes(idx);

                  return (
                    <div
                      key={idx}
                      className={`flex items-center gap-3 text-xs transition-opacity duration-300 ${
                        isCurrent ? 'opacity-100 font-semibold text-slate-900' : isCompleted ? 'opacity-50 text-slate-500' : 'opacity-25 text-slate-400'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                      ) : isCurrent ? (
                        <Loader className="animate-spin h-4 w-4 text-blue-600 flex-shrink-0" />
                      ) : (
                        <div className="h-4 w-4 rounded-full border border-slate-350 flex-shrink-0" />
                      )}
                      <span>{stepMsg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Match results report output */}
        {matchResult && !matching && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeCurve }}
            className="space-y-6"
          >
            {/* Top row: match dials & highlights */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Dial Gauge */}
              <div className="lg:col-span-2 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between items-center text-center">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Overall Match Score</h3>
                  <span className="text-[10px] text-slate-500 mt-0.5 block">Job description compatibility rate</span>
                </div>

                <div className="relative h-32 w-32 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full shadow-inner my-6">
                  <span className="text-3xl font-extrabold text-indigo-600 font-mono">{animatedScore}%</span>
                  <div className="absolute inset-2 rounded-full border-2 border-indigo-500/10 border-t-indigo-600 animate-spin-slow" />
                </div>

                <div className="space-y-1">
                  <span className="text-[10px] text-slate-450 font-bold uppercase tracking-wider block">Interview Probability</span>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                    matchResult.interviewProbability === 'High' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-yellow-50 text-yellow-750 border border-yellow-200'
                  }`}>
                    {matchResult.interviewProbability} probability
                  </span>
                </div>
              </div>

              {/* Subscores & summaries */}
              <div className="lg:col-span-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-850 uppercase tracking-wider">JD Gap Analysis Summary</h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                    {matchResult.matchSummary}
                  </p>
                </div>

                {/* Subscores sliders */}
                <div className="grid grid-cols-2 gap-4 pt-6 border-t border-slate-100 mt-6">
                  {[
                    { name: 'Skills Match', score: matchResult.subScores.skillsMatch, color: 'bg-blue-500', text: 'text-blue-600' },
                    { name: 'Experience Match', score: matchResult.subScores.experienceMatch, color: 'bg-indigo-550', text: 'text-indigo-600' },
                    { name: 'Projects Match', score: matchResult.subScores.projectMatch, color: 'bg-purple-500', text: 'text-purple-600' },
                    { name: 'Education Match', score: matchResult.subScores.educationMatch, color: 'bg-green-500', text: 'text-green-600' },
                  ].map((sub, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-semibold">{sub.name}</span>
                        <span className={`font-bold ${sub.text}`}>{sub.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div className={`h-full ${sub.color} rounded-full`} style={{ width: `${sub.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* CRAZY NODE GRAPH COMPONENT: SDE Skill Alignment Map */}
            <InteractiveSkillGraph
              matched={matchResult.matchedKeywords}
              missing={matchResult.missingKeywords}
              showToast={showToast}
            />

            {/* Keyword mappings & missing links */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Keywords comparison columns */}
              <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-blue-500" /> Key Terms matching
                </h3>

                <div className="space-y-4">
                  {/* Matched Keywords */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-green-655 font-bold uppercase tracking-wider block">Matched Keywords</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.matchedKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-green-50 border border-green-200 text-green-700 rounded-md">
                          {kw}
                        </span>
                      ))}
                      {matchResult.matchedKeywords.length === 0 && <span className="text-xs italic text-slate-400">None detected.</span>}
                    </div>
                  </div>

                  {/* Missing Keywords */}
                  <div className="space-y-2">
                    <span className="text-[9px] text-red-600 font-bold uppercase tracking-wider block">Missing Keywords Gaps</span>
                    <div className="flex flex-wrap gap-1.5">
                      {matchResult.missingKeywords.map((kw, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-red-50 border border-red-200 text-red-705 rounded-md">
                          {kw}
                        </span>
                      ))}
                      {matchResult.missingKeywords.length === 0 && <span className="text-xs italic text-slate-400">None detected.</span>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actionables and optimizations columns */}
              <div className="lg:col-span-3 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> SDE Action Recommendations
                </h3>

                <ul className="space-y-3.5 text-xs text-slate-600 leading-relaxed pl-4 list-disc list-inside">
                  {matchResult.resumeImprovements.map((imp, i) => (
                    <li key={i} className="marker:text-blue-600">{imp}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Keyword gaps list */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Top 10 Keywords to Add (Highest ATS weight)</h3>
              <div className="flex flex-wrap gap-2">
                {matchResult.top10KeywordsToAdd.map((kw, i) => (
                  <span key={i} className="text-xs font-semibold px-2.5 py-1 bg-slate-50 border border-slate-200 text-slate-705 rounded-lg">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Generated Bullet Points */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PlusCircle className="w-4 h-4 text-blue-500" /> Recommended Bullet Refactors (For this Job Description)
              </h3>
              
              <div className="space-y-3">
                {matchResult.optimizedBulletPoints.map((bp, i) => (
                  <div key={i} className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4 text-xs">
                    <p className="text-slate-700 leading-relaxed italic font-medium">"{bp}"</p>
                    <button
                      onClick={() => copyToClipboard(bp)}
                      className="p-1.5 hover:bg-slate-150 rounded-lg text-slate-400 hover:text-slate-850 flex-shrink-0 transition-colors"
                      title="Copy to Clipboard"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Section summaries */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              {/* Experience */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <span className="text-[10px] text-indigo-600 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-indigo-500" /> Experience Assessment
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{matchResult.experienceAnalysis}</p>
              </div>

              {/* Projects */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-blue-500" /> Projects Assessment
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{matchResult.projectAnalysis}</p>
              </div>

              {/* Hiring Recommendation */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-3">
                <span className="text-[10px] text-purple-600 font-bold uppercase tracking-wider block flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-500" /> Hiring Recommendation
                </span>
                <p className="text-xs text-slate-600 leading-relaxed">{matchResult.hiringRecommendation}</p>
              </div>

            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/resume-rewriter')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Improve Resume Bullet Points
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all shadow-xs">
                  <Download className="w-3.5 h-3.5" /> Download Match Report
                </button>
                <button
                  onClick={resetMatcher}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all"
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
