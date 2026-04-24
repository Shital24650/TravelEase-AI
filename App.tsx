
import React, { useState, useEffect, useRef } from 'react';
import { 
  Bus, 
  Train, 
  Plane, 
  MapPin, 
  ArrowRight, 
  Mic, 
  Volume2, 
  MessageCircle, 
  AlertCircle,
  HelpCircle,
  Clock,
  ChevronLeft,
  Loader2,
  X
} from 'lucide-react';
import { Language, TravelMode, TravelPlan, Message } from './types';
import { generateTravelPlan, chatWithAssistant, speakText } from './services/geminiService';

export default function App() {
  const [lang, setLang] = useState<Language>('English');
  const [mode, setMode] = useState<TravelMode>('Best Option');
  const [start, setStart] = useState('');
  const [destination, setDestination] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [travelPlan, setTravelPlan] = useState<TravelPlan | null>(null);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleGeneratePlan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!start || !destination) return;
    
    setIsLoading(true);
    try {
      const plan = await generateTravelPlan(start, destination, mode, lang);
      setTravelPlan(plan);
      setMessages([{
        role: 'assistant',
        content: lang === 'English' ? `Hello! I have created a travel plan from ${start} to ${destination}. How can I help you during your journey?` : 
                 lang === 'Hindi' ? `नमस्ते! मैंने ${start} से ${destination} तक की यात्रा योजना बनाई है। मैं आपकी यात्रा के दौरान कैसे मदद कर सकता हूँ?` :
                 `नमस्कार! मी ${start} ते ${destination} प्रवासाचे नियोजन केले आहे. मी तुम्हाला कशी मदत करू शकतो?`
      }]);
    } catch (error) {
      console.error(error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;
    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    
    const context = `Plan: From ${start} to ${destination} via ${travelPlan?.travelMode}. Steps: ${travelPlan?.steps.map(s => s.instruction).join(', ')}`;
    
    try {
      const aiResponse = await chatWithAssistant(text, context, lang);
      setMessages(prev => [...prev, { role: 'assistant', content: aiResponse }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm having trouble connecting. Please try again." }]);
    }
  };

  const handleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Voice recognition not supported in this browser.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = lang === 'Hindi' ? 'hi-IN' : lang === 'Marathi' ? 'mr-IN' : 'en-US';
    
    recognition.onstart = () => setIsRecording(true);
    recognition.onend = () => setIsRecording(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      if (isChatOpen) {
        handleSendMessage(transcript);
      } else {
        setChatInput(transcript); // or contextually handle based on where we are
      }
    };
    recognition.start();
  };

  const labels = {
    English: {
      title: "TravelEase",
      subtitle: "Your Friendly Travel Companion",
      startLabel: "Where are you starting?",
      destLabel: "Where are you going?",
      modeLabel: "Preferred Mode",
      goBtn: "Plan My Journey",
      estTime: "Estimated Time",
      steps: "Journey Steps",
      tips: "Senior Safety Tips",
      prereq: "Things to Carry",
      assistant: "Travel Assistant",
      askMe: "Ask me anything about your trip...",
      newTrip: "New Trip",
      bestOpt: "Best Option",
      train: "Train",
      bus: "Bus",
      air: "Airplane"
    },
    Hindi: {
      title: "TravelEase",
      subtitle: "आपका मित्रवत यात्रा साथी",
      startLabel: "आप कहां से शुरू कर रहे हैं?",
      destLabel: "आप कहां जा रहे हैं?",
      modeLabel: "पसंदीदा मोड",
      goBtn: "मेरी यात्रा की योजना बनाएं",
      estTime: "अनुमानित समय",
      steps: "यात्रा के चरण",
      tips: "बुजुर्गों के लिए सुरक्षा सुझाव",
      prereq: "साथ ले जाने वाली चीजें",
      assistant: "यात्रा सहायक",
      askMe: "अपनी यात्रा के बारे में कुछ भी पूछें...",
      newTrip: "नई यात्रा",
      bestOpt: "सबसे अच्छा विकल्प",
      train: "ट्रेन",
      bus: "बस",
      air: "हवाई जहाज"
    },
    Marathi: {
      title: "TravelEase",
      subtitle: "तुमचा मित्र प्रवास सोबती",
      startLabel: "तुम्ही कुठून सुरुवात करत आहात?",
      destLabel: "तुम्ही कुठे जात आहात?",
      modeLabel: "प्राधान्य मोड",
      goBtn: "माझ्या प्रवासाचे नियोजन करा",
      estTime: "अंदाजे वेळ",
      steps: "प्रवासाचे टप्पे",
      tips: "ज्येष्ठ नागरिक सुरक्षा टिप्स",
      prereq: "सोबत नेण्याच्या गोष्टी",
      assistant: "प्रवास सहाय्यक",
      askMe: "तुमच्या प्रवासाबद्दल काहीही विचारा...",
      newTrip: "नवीन प्रवास",
      bestOpt: "उत्तम पर्याय",
      train: "रेल्वे",
      bus: "बस",
      air: "विमान"
    }
  }[lang];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center pb-24">
      {/* Header */}
      <header className="w-full bg-blue-600 text-white p-6 shadow-lg flex justify-between items-center sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-white p-2 rounded-full">
            <Bus className="text-blue-600 w-8 h-8" />
          </div>
          <div>
            <h1 className="text-3xl font-bold leading-tight">{labels.title}</h1>
            <p className="text-blue-100 text-sm">{labels.subtitle}</p>
          </div>
        </div>
        
        <div className="flex gap-2">
          {(['English', 'Hindi', 'Marathi'] as Language[]).map(l => (
            <button
              key={l}
              onClick={() => setLang(l)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${lang === l ? 'bg-white text-blue-600' : 'bg-blue-500 text-white hover:bg-blue-400'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </header>

      <main className="w-full max-w-2xl px-4 py-8">
        {!travelPlan ? (
          <div className="bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
            <form onSubmit={handleGeneratePlan} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xl font-semibold text-slate-700 block">{labels.startLabel}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" />
                  <input
                    type="text"
                    value={start}
                    onChange={(e) => setStart(e.target.value)}
                    placeholder="e.g. Pune Station"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none text-xl transition shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xl font-semibold text-slate-700 block">{labels.destLabel}</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-4 text-slate-400" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g. Mumbai Airport"
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 focus:outline-none text-xl transition shadow-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-xl font-semibold text-slate-700 block">{labels.modeLabel}</label>
                <div className="grid grid-cols-2 gap-3">
                  {(['Best Option', 'Train', 'Bus', 'Airplane'] as TravelMode[]).map(m => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMode(m)}
                      className={`flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition text-lg font-medium ${mode === m ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-100 text-slate-600 hover:bg-slate-50'}`}
                    >
                      {m === 'Train' && <Train size={24} />}
                      {m === 'Bus' && <Bus size={24} />}
                      {m === 'Airplane' && <Plane size={24} />}
                      {m === 'Best Option' && <HelpCircle size={24} />}
                      {labels[m === 'Best Option' ? 'bestOpt' : m === 'Train' ? 'train' : m === 'Bus' ? 'bus' : 'air']}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white text-2xl font-bold py-5 rounded-3xl shadow-lg transform active:scale-95 transition flex items-center justify-center gap-3 mt-4"
              >
                {isLoading ? <Loader2 className="animate-spin" /> : <ArrowRight size={32} />}
                {labels.goBtn}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button 
              onClick={() => setTravelPlan(null)}
              className="flex items-center gap-2 text-blue-600 font-semibold text-lg hover:underline"
            >
              <ChevronLeft size={24} /> {labels.newTrip}
            </button>

            {/* Travel Summary Card */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-xl">
              <div className="flex justify-between items-start mb-6">
                <div className="flex items-center gap-4">
                  <div className="bg-white/20 p-3 rounded-2xl">
                    {travelPlan.travelMode.includes('Train') ? <Train size={36} /> : 
                     travelPlan.travelMode.includes('Bus') ? <Bus size={36} /> : <Plane size={36} />}
                  </div>
                  <div>
                    <h2 className="text-3xl font-bold">{travelPlan.travelMode}</h2>
                    <p className="opacity-90">{travelPlan.start} → {travelPlan.destination}</p>
                  </div>
                </div>
                <button 
                  onClick={() => speakText(`${travelPlan.travelMode} from ${travelPlan.start} to ${travelPlan.destination}. Estimated time: ${travelPlan.estimatedTime}`, lang)}
                  className="bg-white/20 p-3 rounded-full hover:bg-white/30"
                >
                  <Volume2 size={24} />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8 pt-6 border-t border-white/20">
                <div className="flex items-center gap-3">
                  <Clock className="text-blue-200" />
                  <div>
                    <p className="text-sm opacity-80 uppercase tracking-wider">{labels.estTime}</p>
                    <p className="text-xl font-bold">{travelPlan.estimatedTime}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AlertCircle className="text-blue-200" />
                  <div>
                    <p className="text-sm opacity-80 uppercase tracking-wider">{labels.prereq}</p>
                    <p className="text-lg">{travelPlan.prerequisites.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Steps Section */}
            <div className="bg-white rounded-3xl shadow-lg p-8 border border-slate-100">
              <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                <MapPin className="text-blue-600" /> {labels.steps}
              </h3>
              <div className="space-y-8">
                {travelPlan.steps.map((step, idx) => (
                  <div key={idx} className="flex gap-6 relative group">
                    {idx !== travelPlan.steps.length - 1 && (
                      <div className="absolute left-6 top-10 w-0.5 h-full bg-slate-100 group-hover:bg-blue-100 transition" />
                    )}
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xl flex-shrink-0 z-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 pb-4">
                      <h4 className="text-xl font-bold text-slate-800 mb-1">{step.title}</h4>
                      <p className="text-slate-600 text-lg leading-relaxed">{step.instruction}</p>
                    </div>
                    <button 
                      onClick={() => speakText(step.instruction, lang)}
                      className="text-slate-300 hover:text-blue-500 transition self-start p-2"
                    >
                      <Volume2 size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Tips Section */}
            <div className="grid grid-cols-1 gap-6">
              <div className="bg-green-50 rounded-3xl p-8 border border-green-100">
                <h3 className="text-2xl font-bold text-green-800 mb-4 flex items-center gap-3">
                  <HelpCircle className="text-green-600" /> {labels.tips}
                </h3>
                <ul className="space-y-3">
                  {travelPlan.tips.map((tip, idx) => (
                    <li key={idx} className="flex gap-3 text-lg text-green-700">
                      <span className="text-green-500 font-bold">•</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Floating Chat Assistant for Seniors */}
      {travelPlan && (
        <>
          <div 
            className={`fixed bottom-0 right-0 left-0 md:right-8 md:left-auto md:bottom-8 md:w-96 transition-all transform ${isChatOpen ? 'translate-y-0 opacity-100' : 'translate-y-full md:translate-y-12 opacity-0 pointer-events-none'}`}
            style={{ zIndex: 50 }}
          >
            <div className="bg-white md:rounded-3xl shadow-2xl border-t md:border border-slate-200 h-[80vh] md:h-[600px] flex flex-col overflow-hidden">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-2 rounded-xl">
                    <MessageCircle />
                  </div>
                  <div>
                    <h4 className="font-bold text-xl">{labels.assistant}</h4>
                    <p className="text-xs opacity-80">Online and ready to help</p>
                  </div>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="p-2 hover:bg-white/10 rounded-full">
                  <X />
                </button>
              </div>
              
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-4 rounded-2xl text-lg shadow-sm ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-white text-slate-800'}`}>
                      {msg.content}
                      {msg.role === 'assistant' && (
                        <button 
                          onClick={() => speakText(msg.content, lang)} 
                          className="block mt-2 text-slate-400 hover:text-blue-500"
                        >
                          <Volume2 size={16} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 bg-white border-t border-slate-100">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage(chatInput)}
                    placeholder={labels.askMe}
                    className="flex-1 bg-slate-100 rounded-2xl px-4 py-4 focus:outline-none focus:ring-2 focus:ring-blue-500 text-lg"
                  />
                  <button 
                    onClick={handleVoiceInput}
                    className={`p-4 rounded-2xl transition shadow-md ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600'}`}
                  >
                    <Mic size={24} />
                  </button>
                  <button 
                    onClick={() => handleSendMessage(chatInput)}
                    className="bg-blue-600 text-white p-4 rounded-2xl shadow-md hover:bg-blue-700 transition"
                  >
                    <ArrowRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsChatOpen(true)}
            className={`fixed bottom-8 right-8 bg-blue-600 text-white p-6 rounded-full shadow-2xl transform transition hover:scale-110 active:scale-95 flex items-center gap-3 z-40 ${isChatOpen ? 'scale-0' : 'scale-100'}`}
          >
            <MessageCircle size={32} />
            <span className="text-xl font-bold pr-2">{labels.assistant}</span>
          </button>
        </>
      )}

      {/* Voice feedback toast when recording */}
      {isRecording && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 bg-red-600 text-white px-6 py-3 rounded-full flex items-center gap-3 shadow-2xl z-[60] animate-bounce">
          <Mic size={20} />
          <span className="font-bold">Listening... Speak now</span>
        </div>
      )}
    </div>
  );
}
