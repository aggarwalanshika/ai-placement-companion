import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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

const easeCurve = [0.16, 1, 0.3, 1] as const;

interface KeywordComparison {
  name: string;
  type: 'matched' | 'missing';
}

interface ProjectAnalysis {
  name: string;
  review: string;
  suggestions: string[];
  improved: string;
}

export default function ResumeAnalyzer() {
  const [dragActive, setDragActive] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadState, setUploadState] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [analyzing, setAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [reportReady, setReportReady] = useState(false);

  const [animatedScore, setAnimatedScore] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const steps = [
    'Reading Resume PDF structure...',
    'Extracting projects, skills, and education details...',
    'Detecting years of experience & role profiles...',
    'Matching keyword density against job targets...',
    'Comparing layout against ATS industry guidelines...',
    'Generating AI SDE suggestions & improved descriptions...',
    'Assembling final resume intelligence scorecard...',
  ];

  useEffect(() => {
    if (analyzing) {
      const stepDuration = 600;
      const interval = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev < steps.length - 1) {
            setCompletedSteps((prevCompleted) => [...prevCompleted, prev]);
            return prev + 1;
          } else {
            clearInterval(interval);
            setTimeout(() => {
              setAnalyzing(false);
              setReportReady(true);
            }, 500);
            return prev;
          }
        });
      }, stepDuration);
      return () => clearInterval(interval);
    }
  }, [analyzing, steps.length]);

  useEffect(() => {
    if (reportReady) {
      let currentVal = 0;
      const targetVal = 87;
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
  }, [reportReady]);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const validateAndProcessFile = (selectedFile: File) => {
    setErrorMessage(null);
    const validTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!validTypes.includes(selectedFile.type)) {
      setUploadState('error');
      setErrorMessage('Unsupported file format. Please upload PDF or DOCX files.');
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      setUploadState('error');
      setErrorMessage('File size exceeds the 5MB maximum limit.');
      return;
    }

    setFile(selectedFile);
    setUploadState('uploading');

    let progress = 0;
    const progressTimer = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(progressTimer);
        setUploadState('success');
        setTimeout(() => {
          setAnalyzing(true);
          setCurrentStepIndex(0);
          setCompletedSteps([]);
        }, 600);
      }
    }, 80);
  };

  const handleSimulatedUpload = () => {
    setErrorMessage(null);
    setUploadState('uploading');
    setUploadProgress(0);
    
    let progress = 0;
    const progressTimer = setInterval(() => {
      progress += 10;
      setUploadProgress(progress);
      if (progress >= 100) {
        clearInterval(progressTimer);
        setUploadState('success');
        setFile(new File([''], 'Software_Engineer_Resume_Mock.pdf', { type: 'application/pdf' }));
        setTimeout(() => {
          setAnalyzing(true);
          setCurrentStepIndex(0);
          setCompletedSteps([]);
        }, 600);
      }
    }, 80);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const triggerFilePicker = () => {
    fileInputRef.current?.click();
  };

  const resetAnalyzer = () => {
    setFile(null);
    setUploadState('idle');
    setUploadProgress(0);
    setReportReady(false);
    setAnalyzing(false);
    setErrorMessage(null);
  };

  const chartData = [
    { subject: 'Experience', score: 85 },
    { subject: 'Projects', score: 90 },
    { subject: 'Skills', score: 75 },
    { subject: 'Education', score: 95 },
    { subject: 'Grammar', score: 92 },
    { subject: 'Formatting', score: 88 },
  ];

  const sectionScores = [
    { name: 'Experience Score', score: 85, color: 'bg-emerald-500', text: 'text-emerald-400' },
    { name: 'Projects Score', score: 90, color: 'bg-green-500', text: 'text-green-400' },
    { name: 'Skills Score', score: 75, color: 'bg-yellow-500', text: 'text-yellow-400' },
    { name: 'Education Score', score: 95, color: 'bg-blue-500', text: 'text-blue-400' },
    { name: 'Grammar Score', score: 92, color: 'bg-indigo-500', text: 'text-indigo-400' },
    { name: 'Formatting Score', score: 88, color: 'bg-purple-500', text: 'text-purple-400' },
  ];

  const missingSkills = ['Docker', 'Redis', 'AWS', 'System Design', 'CI/CD'];

  const aiSuggestions = [
    'Add measurable achievements (e.g. increase metrics or load speeds) in project descriptions.',
    'Quantify SDE project impact (e.g., "reduced query latency by 45% using database caching").',
    'Integrate missing cloud references such as S3, EC2, or Azure services.',
    'Structure your experience descriptions using the Google-style STAR/X-Y-Z formula (Accomplished [X], as measured by [Y], by doing [Z]).',
    'Remove passive terminology like "helped write code" or "worked on backend" and use action verbs.',
    'Align keywords directly matching the Google/Meta entry-level SDE listing keywords.',
    'Condense formatting to guarantee your total resume fits onto one single page.',
    'Move tech stack descriptors to the very top section of the layout to optimize recruiter scans.',
  ];

  const keywordsList: KeywordComparison[] = [
    { name: 'TypeScript / React', type: 'matched' },
    { name: 'Node.js / Express', type: 'matched' },
    { name: 'PostgreSQL', type: 'matched' },
    { name: 'Prisma Client', type: 'matched' },
    { name: 'Docker Containers', type: 'missing' },
    { name: 'Redis Caching', type: 'missing' },
    { name: 'AWS Cloud Services', type: 'missing' },
    { name: 'CI/CD Pipelines', type: 'missing' },
  ];

  const strengths = [
    { title: 'Excellent Projects', desc: 'Demonstrates complete full-stack project builds including database configuration schemas.' },
    { title: 'Strong Technical Stack', desc: 'Highlights core type-safety models utilizing TypeScript, React, and server stacks.' },
    { title: 'Good Education', desc: 'Displays academic SDE milestones and GPA credentials prominently.' },
    { title: 'Relevant Experience', desc: 'Covers practical engineering internships or freelance project modules cleanly.' },
  ];

  const weaknesses = [
    { title: 'Weak Action Verbs', desc: 'Relies on passive wording. Replace with "Formulated", "Engineered", or "Pioneered".' },
    { title: 'No Metrics', desc: 'Lacks quantitative proofs. Add performance percentages or load details.' },
    { title: 'Missing Leadership', desc: 'Does not highlight mentoring sessions, code reviews, or team coordination.' },
    { title: 'Missing Cloud Skills', desc: 'Fails to list cloud infrastructure providers or container orchestration grids.' },
  ];

  const projectsAnalysis: ProjectAnalysis[] = [
    {
      name: 'E-commerce API Engine',
      review: 'Shows strong structural database backend design, but descriptions are wordy and lack concrete latency improvements.',
      suggestions: [
        'Reference specific caching latency details.',
        'Use direct active verbs like "Architected" or "Pioneered".'
      ],
      improved: 'Architected a scalable RESTful e-commerce API backend utilizing Node.js and PostgreSQL, decreasing endpoint response times by 35% through query optimization.',
    },
    {
      name: 'Interactive Dev Portfolio',
      review: 'Clean design and client deployment, but lacks details on CI/CD tooling or optimization frameworks.',
      suggestions: [
        'Highlight asset size compression details.',
        'Document automated deployment integrations.'
      ],
      improved: 'Deployed an interactive developer profile page using React and Tailwind CSS, reducing asset payload bundle sizes by 40% using webpack optimization.',
    }
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-slate-900 pb-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
            <FileSearch className="w-5 h-5 text-blue-400" /> ATS Resume Scanner
          </h1>
          <p className="text-slate-550 text-xs">Verify your ATS score and get SDE-focused keyword recommendations in seconds.</p>
        </div>
        {reportReady && (
          <button
            onClick={resetAnalyzer}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-xs font-semibold rounded-lg text-slate-300 transition-all"
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
                <div
                  onDragEnter={handleDrag}
                  onDragOver={handleDrag}
                  onDragLeave={handleDrag}
                  onDrop={handleDrop}
                  className={`p-12 border-2 border-dashed rounded-2xl text-center flex flex-col items-center justify-center space-y-6 transition-all ${
                    dragActive
                      ? 'border-blue-500 bg-blue-950/10'
                      : 'border-slate-800 bg-slate-900/10 hover:border-slate-700/80 hover:bg-slate-900/20'
                  }`}
                >
                  <div className="p-4 bg-slate-950/60 border border-slate-850 rounded-xl text-slate-400">
                    <Upload className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-sm font-bold text-white">Drag and drop your resume file here</h3>
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
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white shadow-lg shadow-blue-500/15 transition-all"
                  >
                    Choose File from Local Storage
                  </button>

                  {/* Progress Slider Mockup */}
                  {uploadState === 'uploading' && (
                    <div className="w-full max-w-xs space-y-2 pt-2">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-450 font-semibold flex items-center gap-1">
                          <Loader className="animate-spin w-3 h-3 text-blue-500" /> Uploading file...
                        </span>
                        <span className="text-slate-450 font-mono">{uploadProgress}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-500 rounded-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Error Alert */}
                  {uploadState === 'error' && errorMessage && (
                    <div className="w-full max-w-sm rounded-xl bg-red-950/40 border border-red-900/60 p-4 flex gap-3 text-xs text-red-300 text-left">
                      <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0" />
                      <span>{errorMessage}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-12 border border-slate-800 bg-slate-900/10 rounded-2xl text-center flex flex-col items-center justify-center space-y-4">
                  <div className="h-12 w-12 rounded-full bg-green-950/60 border border-green-800 flex items-center justify-center">
                    <Check className="h-6 w-6 text-green-400" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-white block">File Uploaded Successfully!</span>
                    <span className="text-[10px] text-green-400 font-semibold block mt-1">
                      {file?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Quick Upload Tester Banner */}
              <div className="p-4 bg-slate-900/20 border border-slate-900 rounded-xl flex items-center justify-between text-xs">
                <span className="text-slate-400">Want to test the AI report instantly without uploading a file?</span>
                <button
                  onClick={handleSimulatedUpload}
                  className="text-blue-500 font-semibold hover:underline flex items-center gap-0.5"
                >
                  Run simulated analysis <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Right Col: Recent Uploads & Previous Analyses */}
            <div className="lg:col-span-2 space-y-6">
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-400" /> Recent Uploads
                </h3>
                <div className="space-y-3 text-xs">
                  {[
                    { name: 'Software_Engineer_Resume_John.pdf', score: 87, date: 'Just now' },
                    { name: 'Software_Engineer_Resume_V2.pdf', score: 82, date: '1 day ago' },
                    { name: 'Software_Engineer_Resume_V1.pdf', score: 74, date: '4 days ago' }
                  ].map((hist, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 bg-slate-950/40 border border-slate-900 rounded-lg">
                      <span className="text-slate-400 flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
                        <FileText className="w-3.5 h-3.5 text-blue-400" /> {hist.name}
                      </span>
                      <span className="font-semibold text-green-400 font-mono bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60">{hist.score}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Step 3: Full-screen AI Loading Sequence */}
        {analyzing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#070a13] flex flex-col items-center justify-center p-6 select-none"
          >
            <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

            <div className="w-full max-w-md space-y-8 relative z-10">
              <div className="text-center space-y-2">
                <Cpu className="mx-auto h-10 w-10 text-blue-500 animate-pulse" />
                <h3 className="text-base font-bold text-white tracking-wide uppercase">AI Placement Intelligence Core</h3>
                <p className="text-xs text-slate-500">Formulating SDE profile metrics matching job target specifications.</p>
              </div>

              {/* Progress workflow lines */}
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
                          <Loader className="animate-spin h-5 w-5 text-blue-500" />
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

        {/* Step 4: Complete ATS Report */}
        {reportReady && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: easeCurve }}
            className="space-y-6"
          >
            {/* Top Score Banner layout */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
              
              {/* Radar Chart (Left 2 columns) */}
              <div className="md:col-span-2 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
                <div>
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">ATS Breakdown</h3>
                  <span className="text-[10px] text-slate-500 block mt-0.5">Section mapping score distribution</span>
                </div>

                <div className="h-52 w-full pt-4">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart cx="50%" cy="50%" outerRadius="80%" data={chartData}>
                      <PolarGrid stroke="#1e293b" />
                      <PolarAngleAxis dataKey="subject" stroke="#64748b" fontSize={9} />
                      <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#334155" fontSize={8} />
                      <Radar name="John Doe" dataKey="score" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Dials & Overall Score details (Right 3 columns) */}
              <div className="md:col-span-3 p-6 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-col justify-between">
                
                {/* Gauge Row */}
                <div className="flex gap-6 items-center">
                  {/* Score circle */}
                  <div className="relative h-24 w-24 flex items-center justify-center bg-slate-950 border border-slate-900 rounded-full shadow-lg">
                    <span className="text-2xl font-extrabold text-green-400 font-mono">{animatedScore}</span>
                    <span className="text-[10px] text-slate-500 absolute bottom-4">/ 100</span>
                    <div className="absolute inset-2 rounded-full border-2 border-green-500/10 border-t-green-400" />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-white">Google SDE Compatibility</h2>
                    <span className="text-xs font-semibold text-green-400 bg-green-950/40 px-2 py-0.5 rounded border border-green-900/60 uppercase tracking-wide inline-block mt-1">
                      Ready for Review
                    </span>
                    <p className="text-[10px] text-slate-400 mt-2 leading-relaxed">
                      Excellent structural consistency. Your projects score is outstanding, but incorporating Redis and cloud containers will finalize your target matching metrics.
                    </p>
                  </div>
                </div>

                {/* Subsections Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pt-6 border-t border-slate-900/60 mt-6">
                  {sectionScores.map((sec, idx) => (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-[10px]">
                        <span className="text-slate-455 font-semibold">{sec.name}</span>
                        <span className={`font-bold ${sec.text}`}>{sec.score}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
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
              <div className="lg:col-span-2 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Keywords Comparison</h3>
                
                <div className="space-y-2">
                  {keywordsList.map((kw, idx) => (
                    <div key={idx} className="flex justify-between items-center p-3 bg-slate-950/40 border border-slate-900 rounded-lg text-xs">
                      <span className="font-semibold text-white">{kw.name}</span>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded uppercase ${
                        kw.type === 'matched' ? 'bg-green-950/40 border border-green-900/40 text-green-400' : 'bg-red-950/40 border border-red-900/40 text-red-400'
                      }`}>
                        {kw.type}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Recommendations List */}
              <div className="lg:col-span-3 p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-yellow-400" /> SDE Action Recommendations
                </h3>
                
                <ul className="space-y-3.5 text-xs text-slate-400 leading-relaxed pl-4 list-disc list-inside">
                  {aiSuggestions.map((sug, idx) => (
                    <li key={idx} className="marker:text-blue-500">{sug}</li>
                  ))}
                </ul>
              </div>

            </div>

            {/* Missing Skills Chips Display */}
            <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Missing Skills</h3>
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, idx) => (
                  <span key={idx} className="text-xs font-semibold px-3 py-1 bg-red-955/40 border border-red-900/50 text-red-400 rounded-lg">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Strengths */}
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-green-400 uppercase tracking-wider">Identified Strengths</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {strengths.map((str, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-1">
                      <span className="text-xs font-bold text-white block">{str.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{str.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider">Identified Weaknesses</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {weaknesses.map((wk, idx) => (
                    <div key={idx} className="p-3 bg-slate-950/40 border border-slate-900 rounded-lg space-y-1">
                      <span className="text-xs font-bold text-white block">{wk.title}</span>
                      <p className="text-[10px] text-slate-500 leading-relaxed">{wk.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Project Deep-Dive Analysis */}
            <div className="p-5 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
              <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Projects Analysis Reports</h3>
              
              <div className="space-y-4">
                {projectsAnalysis.map((proj, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/40 border border-slate-900 rounded-xl space-y-3 text-xs">
                    <div className="flex justify-between items-center border-b border-slate-900/60 pb-2">
                      <span className="font-bold text-white block">{proj.name}</span>
                      <span className="text-[9px] text-slate-500 uppercase tracking-wider font-semibold">AI Assessment</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <span className="text-[9px] text-slate-500 uppercase font-bold block">Review Summary</span>
                        <p className="text-slate-400 leading-relaxed">{proj.review}</p>
                        
                        <div className="pt-2">
                          <span className="text-[9px] text-slate-500 uppercase font-bold block mb-1">Key Actionables</span>
                          <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400">
                            {proj.suggestions.map((s, i) => (
                              <li key={i}>{s}</li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="p-3 bg-blue-955/10 border border-blue-900/40 rounded-lg space-y-1">
                        <span className="text-[9px] text-blue-400 font-bold block uppercase">Recommended Bullet Point Refactor</span>
                        <p className="text-slate-300 leading-relaxed font-medium italic">
                          "{proj.improved}"
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions Bar */}
            <div className="p-4 bg-slate-900/20 border border-slate-800/80 rounded-2xl shadow-xl flex flex-wrap gap-4 items-center justify-between">
              <div className="flex gap-4">
                <button className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-xs font-bold rounded-lg text-white transition-all shadow-md shadow-blue-500/10">
                  <Download className="w-3.5 h-3.5" /> Download PDF Report
                </button>
                <button
                  onClick={resetAnalyzer}
                  className="flex items-center gap-1.5 px-4 py-2 bg-slate-950 border border-slate-900 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-300 transition-all"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Upload Different Resume
                </button>
              </div>

              <div className="flex gap-3">
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-900 text-slate-655 text-xs font-semibold rounded-lg cursor-not-allowed"
                >
                  <MessageSquare className="w-3.5 h-3.5" /> Ask AI About Resume
                </button>
                <button
                  disabled
                  className="flex items-center gap-1.5 px-3 py-2 bg-slate-950 border border-slate-900 text-slate-655 text-xs font-semibold rounded-lg cursor-not-allowed"
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
