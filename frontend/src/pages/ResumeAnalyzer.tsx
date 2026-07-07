import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useResumeStore } from '../store/resumeStore.js';
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from 'recharts';
import {
  Upload,
  FileText,
  AlertTriangle,
  ArrowRight,
  Loader,
  Cpu,
  FileSearch,
  Check,
  Download,
  MessageSquare,
  Video,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { api } from '../services/api.ts';

const easeCurve = [0.16, 1, 0.3, 1] as const;

interface SectionScores {
  experience: number;
  projects: number;
  skills: number;
  education: number;
  grammar: number;
  formatting: number;
}

interface StrengthOrWeakness {
  title: string;
  desc: string;
}

interface KeywordComparison {
  name: string;
  type: 'matched' | 'missing';
}

interface ProjectAnalysisItem {
  name: string;
  review: string;
  suggestions: string[];
  improved: string;
}

interface ResumeAnalysisResult {
  overallScore: number;
  sectionScores: SectionScores;
  strengths: StrengthOrWeakness[];
  weaknesses: StrengthOrWeakness[];
  missingSkills: string[];
  suggestions: string[];
  keywordMatch: KeywordComparison[];
  resumeSummary: string;
  projectAnalysis: ProjectAnalysisItem[];
  resumeText?: string;
}

export default function ResumeAnalyzer() {
  const navigate = useNavigate();
  const setResumeStoreData = useResumeStore((state) => state.setResumeData);
  const versions = useResumeStore((state) => state.versions) || [];

  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [reportReady, setReportReady] = useState(false);

  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysisResult | null>(null);
  const [animatedScore, setAnimatedScore] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Reading resume content...',
    'Organizing experiences and projects...',
    'Checking writing and formatting...',
    'Identifying technical skills...',
    'Calculating resume score...',
  ];

  useEffect(() => {
    if (analyzing) {
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            setCompletedSteps((c) => [...c, prev]);
            return prev + 1;
          } else {
            clearInterval(interval);
            setCompletedSteps((c) => [...c, prev]);
            setTimeout(() => {
              setAnalyzing(false);
              setReportReady(true);
            }, 600);
            return prev;
          }
        });
      }, 1500);
      return () => clearInterval(interval);
    }
  }, [analyzing, steps.length]);

  useEffect(() => {
    if (reportReady && analysisResult) {
      let current = 0;
      const target = analysisResult.overallScore;
      const duration = 1000;
      const stepTime = Math.abs(Math.floor(duration / target));

      const timer = setInterval(() => {
        current += 1;
        setAnimatedScore(current);
        if (current >= target) {
          clearInterval(timer);
          setAnimatedScore(target);
        }
      }, stepTime);

      return () => clearInterval(timer);
    }
  }, [reportReady, analysisResult]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = async (selectedFile: File) => {
    const isPDF = selectedFile.type === 'application/pdf';
    const isDocx = selectedFile.name.endsWith('.docx') || selectedFile.name.endsWith('.doc');

    if (!isPDF && !isDocx) {
      setUploadState('error');
      setErrorMessage('Please upload a PDF or Word document (.docx) file.');
      return;
    }

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
      setAnalysisResult(response.data.data);

      setTimeout(() => {
        setAnalyzing(true);
        setCurrentStepIndex(0);
        setCompletedSteps([]);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setUploadState('error');
      setErrorMessage(err.response?.data?.message || 'Error occurred while analyzing resume file.');
    }
  };

  const handleSimulatedUpload = async () => {
    setUploadState('uploading');
    setUploadProgress(0);

    const interval = setInterval(() => {
      setUploadProgress((p) => {
        if (p < 100) return p + 25;
        clearInterval(interval);
        return 100;
      });
    }, 80);

    try {
      const mockBlob = new Blob(
        [
          `BT /F1 12 Tf 72 712 Td (Anshika Aggarwal. SDE Profile. Phone: +91-8707881770. email: aggarwalanshika4@gmail.com. Experience: React, Node.js, TypeScript, PostgreSQL.) Tj ET`,
        ],
        { type: 'application/pdf' }
      );
      const mockFile = new File([mockBlob], 'Software_Engineer_Resume_Mock.pdf', { type: 'application/pdf' });
      const formData = new FormData();
      formData.append('resume', mockFile);

      const response = await api.post('/resume/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      clearInterval(interval);
      setUploadProgress(100);
      setUploadState('success');
      setAnalysisResult(response.data.data);

      setTimeout(() => {
        setAnalyzing(true);
        setCurrentStepIndex(0);
        setCompletedSteps([]);
      }, 500);
    } catch (err: any) {
      clearInterval(interval);
      setUploadState('error');
      setErrorMessage(err.response?.data?.message || 'Mock simulation request failed.');
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const resetAnalyzer = () => {
    setFile(null);
    setUploadProgress(0);
    setUploadState('idle');
    setErrorMessage(null);
    setReportReady(false);
    setAnalysisResult(null);
    setAnimatedScore(0);
  };

  // Compile store updates
  useEffect(() => {
    if (reportReady && analysisResult && file) {
      setResumeStoreData(analysisResult.resumeText || '', file.name, analysisResult);
    }
  }, [reportReady, analysisResult, file, setResumeStoreData]);

  const getChartData = () => {
    if (!analysisResult?.sectionScores) return [];
    const scores = analysisResult.sectionScores;
    return [
      { subject: 'Experience', score: scores.experience || 70, fullMark: 100 },
      { subject: 'Projects', score: scores.projects || 75, fullMark: 100 },
      { subject: 'Skills', score: scores.skills || 80, fullMark: 100 },
      { subject: 'Education', score: scores.education || 90, fullMark: 100 },
      { subject: 'Grammar', score: scores.grammar || 85, fullMark: 100 },
      { subject: 'Formatting', score: scores.formatting || 80, fullMark: 100 },
    ];
  };

  const getSectionScores = () => {
    if (!analysisResult?.sectionScores) return [];
    const sc = analysisResult.sectionScores;
    return [
      { name: 'Experience', score: sc.experience || 70, color: 'bg-blue-500', text: 'text-blue-600' },
      { name: 'Projects', score: sc.projects || 75, color: 'bg-indigo-500', text: 'text-indigo-600' },
      { name: 'Technical Skills', score: sc.skills || 80, color: 'bg-green-500', text: 'text-green-600' },
      { name: 'Education', score: sc.education || 90, color: 'bg-purple-500', text: 'text-purple-600' },
      { name: 'Grammar', score: sc.grammar || 85, color: 'bg-yellow-500', text: 'text-yellow-600' },
      { name: 'Formatting', score: sc.formatting || 80, color: 'bg-cyan-500', text: 'text-cyan-600' },
    ];
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-10 select-none">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-950 flex items-center gap-1.5">
            <FileSearch className="w-5 h-5 text-indigo-600" /> Resume Analyzer & Scoring
          </h1>
          <p className="text-slate-550 text-xs">Verify your ATS score and get SDE-focused keyword recommendations in seconds.</p>
        </div>
        {reportReady && (
          <button
            onClick={resetAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Upload New Resume
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {!analyzing && !reportReady && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.4, ease: easeCurve }}
            className="grid grid-cols-1 lg:grid-cols-5 gap-6"
          >
            {/* Left Col: Upload Zone */}
            <div className="lg:col-span-3 space-y-6">
              {uploadState !== 'success' ? (
                <motion.div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  whileHover={{ scale: 1.005, translateY: -2 }}
                  className={`p-12 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center space-y-6 transition-all shadow-2xs ${
                    dragActive
                      ? 'border-blue-500 bg-blue-50/50'
                      : 'border-slate-250 bg-white hover:border-slate-350 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-slate-450 group-hover:scale-110 transition-transform">
                    <Upload className="h-8 w-8 text-slate-400" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-slate-800">Drag and drop your resume file here</h3>
                    <p className="text-[11px] text-slate-500">Supports PDF or DOCX formats up to 5MB.</p>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                  />

                  <button
                    onClick={triggerFilePicker}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-sm transition-all"
                  >
                    Choose File from Local Storage
                  </button>

                  {/* Progress Slider Mockup */}
                  {uploadState === 'uploading' && (
                    <div className="w-full max-w-xs space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-semibold flex items-center gap-1">
                          <Loader className="animate-spin w-3 h-3 text-blue-600" /> Uploading file...
                        </span>
                        <span className="text-slate-500 font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {uploadState === 'error' && errorMessage && (
                    <div className="w-full max-w-sm rounded-xl bg-red-50 border border-red-200 p-4 flex gap-3 text-xs text-red-600 text-left animate-shake">
                      <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </motion.div>
              ) : (
                <div className="p-12 border border-slate-200 bg-white rounded-2xl text-center flex flex-col items-center justify-center space-y-4 shadow-2xs">
                  <div className="h-12 w-12 rounded-full bg-green-50 border border-green-200 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-500" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">File Uploaded Successfully!</span>
                    <span className="text-[10px] text-green-600 font-semibold block mt-1">
                      {file?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Upload Tester Banner */}
              <motion.div
                whileHover={{ scale: 1.005, translateY: -1 }}
                className="p-4 bg-white border border-slate-200 rounded-xl flex items-center justify-between text-xs shadow-2xs transition-all duration-300"
              >
                <span className="text-slate-500">Want to test the AI report instantly without uploading a file?</span>
                <button
                  onClick={handleSimulatedUpload}
                  className="text-blue-600 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Run simulated analysis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </motion.div>
            </div>

            {/* Right Col: Recent Uploads & Previous Analyses */}
            <div className="lg:col-span-2 space-y-6">
              <motion.div
                whileHover={{ translateY: -2 }}
                className="p-5 bg-white border border-slate-200 rounded-xl space-y-4 shadow-2xs transition-all duration-300"
              >
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-500" /> Recent Uploads
                </h3>
                <div className="space-y-3 text-xs">
                  {versions.length === 0 ? (
                    <span className="text-slate-500 italic block py-2">No recent uploads yet.</span>
                  ) : (
                    versions.map((hist, idx) => (
                      <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-50 border border-slate-200 rounded-lg hover:border-blue-500 hover:shadow-3xs transition-all duration-200 hover:translate-x-0.5">
                        <span className="text-slate-700 flex items-center gap-1.5 hover:text-slate-900 transition-colors cursor-pointer font-medium">
                          <FileText className="w-3.5 h-3.5 text-blue-500" /> {hist.fileName || 'resume.pdf'}
                        </span>
                        <span className="font-semibold text-green-600 font-mono bg-green-50 px-2 py-0.5 rounded border border-green-200">{hist.atsScore}%</span>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Full-screen AI Loading Sequence */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-50 flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <Cpu className="mx-auto h-10 w-10 text-blue-600 animate-pulse" />
                <h3 className="text-base font-bold text-slate-800 tracking-wide uppercase">AI Resume Analyzer</h3>
                <p className="text-xs text-slate-500">Reviewing your resume draft against target requirements.</p>
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
                        <div className="h-4 w-4 rounded-full border border-slate-300 flex-shrink-0" />
                      )}
                      <span>{stepMsg}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 4: AI Report Dashboards */}
        {reportReady && analysisResult && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: easeCurve }}
            className="space-y-6"
          >
            {/* Top row: Gauges & breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Radar Chart */}
              <div className="md:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">ATS Breakdown</h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Section mapping score distribution</span>
                </div>

                <div className="h-52 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={getChartData()}>
                      <PolarGrid stroke="#e2e8f0" />
                      <PolarAngleAxis dataKey="subject" stroke="#475569" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#cbd5e1" fontSize={8} />
                      <Radar name="Candidate" dataKey="score" stroke="#2563eb" fill="#3b82f6" fillOpacity={0.15} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dials & Overall Score details */}
              <div className="md:col-span-3 p-6 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-col justify-between">
                
                {/* Gauge Row */}
                <div className="flex gap-6 items-center">
                  {/* Score circle */}
                  <div className="relative h-24 w-24 flex items-center justify-center bg-slate-50 border border-slate-200 rounded-full shadow-inner">
                    <span className="text-2xl font-extrabold text-green-600 font-mono">{animatedScore}</span>
                    <span className="text-[10px] text-slate-400 absolute bottom-4">/ 100</span>
                    <div className="absolute inset-2 rounded-full border-2 border-green-500/10 border-t-green-500" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-slate-900">ATS SDE Compatibility</h2>
                    <span className="text-xs font-semibold text-green-700 bg-green-50 px-2 py-0.5 rounded border border-green-200 uppercase tracking-wide inline-block mt-1">
                      Ready for Review
                    </span>
                    <p className="text-[10px] text-slate-500 mt-2 leading-relaxed">
                      {analysisResult.resumeSummary || 'Resume summary parsed successfully by generative SDE filters.'}
                    </p>
                  </div>
                </div>

                {/* Subsections Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-100 mt-6">
                  {getSectionScores().map((sec, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-500 font-semibold">{sec.name}</span>
                        <span className={`font-bold ${sec.text}`}>{sec.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                        <div
                          className={`h-full ${sec.color} rounded-full`}
                          style={{ width: `${sec.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>

            {/* Keyword Comparisons & Suggestions */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
              
              {/* Matched vs Missing Keywords */}
              <div className="lg:col-span-2 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Keywords Comparison</h3>
                
                <div className="space-y-2">
                  {(analysisResult.keywordMatch || []).map((kw, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
                      <span className="font-semibold text-slate-800">{kw.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        kw.type === 'matched' ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-750'
                      }`}>
                        {kw.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations List */}
              <div className="lg:col-span-3 p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> SDE Action Recommendations
                </h3>
                
                <ul className="space-y-3.5 text-xs text-slate-600 leading-relaxed pl-4 list-disc list-inside">
                  {(analysisResult.suggestions || []).map((sug, idx) => (
                    <li key={idx} className="marker:text-blue-600">{sug}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Missing Skills Chips Display */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {(analysisResult.missingSkills || []).map((skill, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1 bg-red-50 border border-red-200 text-red-700 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-green-600 uppercase tracking-wider">Identified Strengths</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysisResult.strengths || []).map((str, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-slate-900 block">{str.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{str.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
                <h3 className="text-xs font-bold text-red-600 uppercase tracking-wider">Identified Weaknesses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {(analysisResult.weaknesses || []).map((wk, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-1">
                      <span className="text-xs font-bold text-slate-900 block">{wk.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{wk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Deep-Dive Analysis */}
            <div className="p-5 bg-white border border-slate-200 rounded-2xl shadow-xs space-y-4">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Projects Analysis Reports</h3>
              
              <div className="space-y-4">
                {(analysisResult.projectAnalysis || []).map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                      <span className="font-bold text-slate-900 block">{proj.name}</span>
                      <span className="text-[9px] text-slate-450 uppercase tracking-wider font-semibold">AI Assessment</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Review Summary</span>
                        <p className="text-slate-600 leading-relaxed">{proj.review}</p>
                        
                        <div className="pt-2">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Key Actionables</span>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-550">
                            {(proj.suggestions || []).map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-4 bg-blue-50/50 border border-blue-200 rounded-xl space-y-1">
                        <span className="text-[9px] text-blue-600 font-bold block uppercase">Recommended Bullet Point Refactor</span>
                        <p className="text-slate-700 leading-relaxed font-semibold italic">
                          "{proj.improved}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                {(!analysisResult.projectAnalysis || analysisResult.projectAnalysis.length === 0) && (
                  <div className="text-slate-500 text-xs italic text-center py-4 bg-slate-50 rounded-xl border border-slate-200">
                    No distinct SDE projects identified in the parsed document.
                  </div>
                )}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-xs flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button
                  onClick={() => navigate('/resume-rewriter')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Improve Resume
                </button>
                <button className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-750 transition-all">
                  <Download className="w-3.5 h-3.5" /> Download PDF Report
                </button>
                <button
                  onClick={() => navigate('/job-description-matcher')}
                  className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-xs font-bold rounded-lg text-white transition-all shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-yellow-300" /> Match With Job Description
                </button>
                <button
                  onClick={resetAnalyzer}
                  className="flex items-center gap-1.5 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-xs font-semibold rounded-lg text-slate-700 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload Different Resume
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Ask AI About Resume
                </button>
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-100 border border-slate-200 text-slate-400 text-xs font-semibold rounded-lg cursor-not-allowed"
                >
                  <Video className="w-3.5 h-3.5" /> Generate Interview Questions
                </button>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
