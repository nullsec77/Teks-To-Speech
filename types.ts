
export interface TtsOptions {
  gender: 'pria' | 'wanita';
  age: 'dewasa' | 'muda' | 'anak-anak';
  accent: 'Indonesia netral' | 'Jawa' | 'Sunda' | 'Melayu';
  style: 'ramah' | 'percaya diri' | 'lembut' | 'energik';
  emotion: 'senang' | 'sedih' | 'serius' | 'santai' | 'natural' | 'antusias';
  tempo: 'lambat' | 'normal' | 'cepat';
  pitch: 'rendah' | 'normal' | 'tinggi';
  personality: 'humoris' | 'hangat' | 'bijak' | 'pintar';
  context: 'formal' | 'story' | 'iklan' | 'customer service' | 'storyteller';
}

export interface HistoryItem {
  id: string;
  text: string;
  options: TtsOptions;
  audioBase64: string;
  prompt: string;
  timestamp: number;
}
