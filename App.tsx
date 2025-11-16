
import React, { useState, useCallback, useMemo } from 'react';
import { TtsControls } from './components/TtsControls';
import { AudioResult } from './components/AudioResult';
import { HistoryList } from './components/HistoryList';
import { ApiKeyInput } from './components/ApiKeyInput';
import { useLocalStorage } from './hooks/useLocalStorage';
import type { HistoryItem, TtsOptions } from './types';
import { generateSpeech } from './services/geminiService';
import { LoadingIcon, SparklesIcon, SpeakerIcon } from './components/icons';

export const App: React.FC = () => {
  const [apiKey, setApiKey] = useLocalStorage<string>('gemini-api-key', '');
  const [history, setHistory] = useLocalStorage<HistoryItem[]>('tts-history', []);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentAudio, setCurrentAudio] = useState<HistoryItem | null>(null);
  
  const [text, setText] = useState<string>('Halo! Selamat datang di generator Teks ke Suara AI. Silahkan Masukkan teks disini');
  const [options, setOptions] = useState<TtsOptions>({
    gender: 'pria',
    age: 'dewasa',
    accent: 'Indonesia netral',
    style: 'ramah',
    emotion: 'natural',
    tempo: 'normal',
    pitch: 'normal',
    personality: 'hangat',
    context: 'storyteller',
  });

  const constructPrompt = useCallback((opts: TtsOptions): string => {
    const { gender, age, accent, style, emotion, tempo, pitch, personality, context } = opts;
    
    const voiceIdentity = `Suara ${gender} ${age}, nada ${style}, aksen ${accent}.`;
    const emotionDesc = `Berikan sentuhan emosi ${emotion} tapi tetap natural.`;
    const prosody = `Tempo bicara ${tempo}, pitch suara ${pitch}, dengan jeda alami di setiap koma.`;
    const personalityDesc = `Kepribadian suara ${personality}.`;
    const contextDesc = `Baca teks ini seolah-olah Anda adalah seorang ${context} profesional.`;
    const pronunciation = `Pastikan pengucapan setiap kata jelas dan tidak ada pemenggalan kata yang aneh.`;

    return `Instruksi suara: ${[voiceIdentity, emotionDesc, prosody, personalityDesc, contextDesc, pronunciation].join(' ')}`;
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!apiKey.trim()) {
      setError('Silakan masukkan Kunci API Gemini Anda.');
      return;
    }
    if (!text.trim()) {
      setError('Silakan masukkan teks untuk menghasilkan audio.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setCurrentAudio(null);

    try {
      const prompt = constructPrompt(options);
      const fullText = `${prompt} Teks yang akan dibaca adalah: "${text}"`;
      const audioBase64 = await generateSpeech(fullText, apiKey);
      
      const newHistoryItem: HistoryItem = {
        id: new Date().toISOString(),
        text,
        options,
        audioBase64,
        prompt: fullText,
        timestamp: Date.now(),
      };

      setCurrentAudio(newHistoryItem);
      setHistory(prev => [newHistoryItem, ...prev.slice(0, 49)]);

    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan yang tidak diketahui.');
    } finally {
      setIsLoading(false);
    }
  }, [text, apiKey, options, constructPrompt, setHistory]);

  const canGenerate = useMemo(() => text.trim().length > 0 && apiKey.trim().length > 0 && !isLoading, [text, apiKey, isLoading]);

  const handlePlayHistory = (item: HistoryItem) => {
    setCurrentAudio(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleClearHistory = () => {
    if(window.confirm('Apakah Anda yakin ingin menghapus seluruh riwayat? Tindakan ini tidak dapat dibatalkan.')) {
        setHistory([]);
    }
  }

  return (
    <div className="min-h-screen text-gray-800 dark:text-gray-200 transition-colors duration-300">
      <main className="container mx-auto p-4 md:p-8">
        <header className="text-center mb-8">
          <div className="flex items-center justify-center gap-4">
            <SpeakerIcon className="w-10 h-10 text-indigo-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500">
              Ai Text To Speech
            </h1>
          </div>
          <div className="mt-4 flex flex-wrap justify-center items-center gap-x-2 gap-y-1 text-[10px]">
            <span className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              by Nullsec77
            </span>
            <a href="https://github.com/nullsec77" target="_blank" rel="noopener noreferrer" className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              Official GitHub
            </a>
            <span className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 px-2 py-1 rounded-full">
              Single License – No Redistribution
            </span>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <ApiKeyInput apiKey={apiKey} setApiKey={setApiKey} />

            <div className="bg-white dark:bg-gray-800/50 rounded-2xl shadow-lg backdrop-blur-sm border border-gray-200 dark:border-gray-700 p-6">
              <label htmlFor="text-input" className="block text-xl font-semibold mb-3 text-gray-700 dark:text-gray-300">
                Teks Anda
              </label>
              <textarea
                id="text-input"
                rows={8}
                value={text}
                onChange={(e) => setText(e.target.value)}
                className="w-full p-4 bg-gray-100 dark:bg-gray-900/50 rounded-xl border-2 border-transparent focus:border-indigo-500 focus:ring-0 transition duration-300 placeholder-gray-400"
                placeholder="Masukkan teks untuk diubah menjadi suara..."
              ></textarea>
            </div>

            <TtsControls options={options} setOptions={setOptions} />

            <div className="flex justify-center">
              <button
                onClick={handleGenerate}
                disabled={!canGenerate}
                className="flex items-center justify-center gap-3 px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-lg"
              >
                {isLoading ? (
                  <>
                    <LoadingIcon className="w-6 h-6 animate-spin" />
                    <span>Menghasilkan...</span>
                  </>
                ) : (
                  <>
                    <SparklesIcon className="w-6 h-6" />
                    <span>Hasilkan Suara</span>
                  </>
                )}
              </button>
            </div>
            {error && <p className="text-center text-red-500 mt-4">{error}</p>}
            
            {currentAudio && <AudioResult item={currentAudio} />}
          </div>

          <div className="lg:col-span-1">
            <HistoryList history={history} onPlay={handlePlayHistory} onClear={handleClearHistory} />
          </div>
        </div>
      </main>
    </div>
  );
};
