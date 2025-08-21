import React, { useState } from 'react';
import { TodoWithCategories, Category } from '../types';

interface DailyDigestProps {
  todos: TodoWithCategories[];
  categories: Category[];
}

type MotivationStyle = 'coach' | 'zen' | 'startup' | 'nerdy' | 'positivity' | 'gamer';
type MediaType = 'quote' | 'gif' | 'ai-image' | 'surprise';
type QuoteTheme = 'tech' | 'success' | 'zen' | 'funny' | 'movies';
type QuoteLanguage = 'deutsch' | 'english' | 'denglisch';
type QuoteLength = 'oneliner' | 'paragraph';
type GifMood = 'pumped' | 'calm' | 'funny' | 'cute';
type ImageStyle = 'realistic' | 'cartoon' | 'abstract' | 'anime';

interface DigestSettings {
  emailEnabled: boolean;
  deliveryTime: string;
  motivationStyle: MotivationStyle;
  includeOverdue: boolean;
  showStats: boolean;
  includeWeather: boolean;
  aiRecommendations: boolean;
  mediaType: MediaType;
  quoteTheme: QuoteTheme;
  quoteLanguage: QuoteLanguage;
  quoteLength: QuoteLength;
  gifMood: GifMood;
  imageStyle: ImageStyle;
  customPrompt: string;
  smartContext: boolean;
}

const DailyDigest: React.FC<DailyDigestProps> = ({ todos, categories }) => {
  const [settings, setSettings] = useState<DigestSettings>({
    emailEnabled: false,
    deliveryTime: '08:00',
    motivationStyle: 'coach',
    includeOverdue: true,
    showStats: true,
    includeWeather: false,
    aiRecommendations: true,
    mediaType: 'quote',
    quoteTheme: 'tech',
    quoteLanguage: 'deutsch',
    quoteLength: 'oneliner',
    gifMood: 'pumped',
    imageStyle: 'realistic',
    customPrompt: '',
    smartContext: false
  });

  const [previewEmail, setPreviewEmail] = useState<string>('');
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);

  const motivationStyles = {
    coach: { emoji: '💪', name: 'Motivational Coach', example: '"Du schaffst das! Jeder Tag ist eine neue Chance!"' },
    zen: { emoji: '🧘', name: 'Zen Master', example: '"Ein Schritt nach dem anderen. Der Weg ist das Ziel."' },
    startup: { emoji: '🚀', name: 'Startup Founder', example: '"Move fast, break things! Today we ship!"' },
    nerdy: { emoji: '🤖', name: 'Nerdy', example: '"May the productivity be with you. Time to optimize!"' },
    positivity: { emoji: '🌈', name: 'Positivity Guru', example: '"Today is YOUR day! Strahle wie ein Regenbogen!"' },
    gamer: { emoji: '🎮', name: 'Gamer', example: '"Zeit für den nächsten Level-Up! Achievement unlocked!"' }
  };

  const updateSetting = <K extends keyof DigestSettings>(key: K, value: DigestSettings[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const generatePreview = async () => {
    setIsGeneratingPreview(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const overdueTodos = todos.filter(todo => todo.due_date && new Date(todo.due_date) < new Date() && todo.status !== 'completed');
    const todayTodos = todos.filter(todo => {
      if (!todo.due_date) return false;
      const today = new Date();
      const todoDate = new Date(todo.due_date);
      return todoDate.toDateString() === today.toDateString();
    });

    const motivationText = motivationStyles[settings.motivationStyle].example;
    
    let mediaContent = '';
    switch (settings.mediaType) {
      case 'quote':
        mediaContent = `📝 "${getQuoteExample()}"`;
        break;
      case 'gif':
        mediaContent = `🎬 [Animated GIF: ${settings.gifMood} mood from Giphy]`;
        break;
      case 'ai-image':
        mediaContent = `🖼️ [AI-Generated Image: ${settings.imageStyle} style${settings.customPrompt ? ` - "${settings.customPrompt}"` : ''}]`;
        break;
      case 'surprise':
        mediaContent = `🎲 [Surprise content - could be quote, GIF, or image!]`;
        break;
    }

    const preview = `
📧 Daily Digest - ${new Date().toLocaleDateString('de-DE')}

${motivationText}

${mediaContent}

📊 DEINE AUFGABEN HEUTE:
${todayTodos.length > 0 ? todayTodos.map(todo => `• ${todo.title}`).join('\n') : '• Keine Aufgaben heute - Zeit für Entspannung! 🌅'}

${settings.includeOverdue && overdueTodos.length > 0 ? `
⚠️ ÜBERFÄLLIGE AUFGABEN:
${overdueTodos.map(todo => `• ${todo.title} (seit ${new Date(todo.due_date!).toLocaleDateString('de-DE')})`).join('\n')}
` : ''}

${settings.showStats ? `
📈 PRODUKTIVITÄTS-STATS:
• Abgeschlossen diese Woche: ${todos.filter(t => t.status === 'completed').length}
• In Bearbeitung: ${todos.filter(t => t.status === 'in_progress').length}
• Durchschnittliche Priorität: ${(todos.reduce((sum, t) => sum + t.priority, 0) / todos.length || 0).toFixed(1)}
` : ''}

${settings.includeWeather ? `
🌤️ WETTER HEUTE:
• 22°C, teilweise bewölkt
• Perfektes Wetter für produktive Arbeit!
` : ''}

${settings.aiRecommendations ? `
🤖 AI-EMPFEHLUNGEN:
• Starte mit deiner höchsten Priorität
• Plane 15min Pausen zwischen großen Aufgaben
• Heute ist ein guter Tag für kreative Arbeit!
` : ''}

${settings.smartContext ? `
🧠 SMART CONTEXT:
Basierend auf deiner Arbeitsbelastung (${getTodayWorkload()}) und dem ${getDayOfWeek()} empfehle ich dir ${getContextualAdvice()}.
` : ''}

Viel Erfolg heute! 🎯
Deine Todo-App
    `.trim();

    setPreviewEmail(preview);
    setIsGeneratingPreview(false);
  };

  const getQuoteExample = () => {
    const quotes = {
      tech: {
        deutsch: settings.quoteLength === 'oneliner' 
          ? 'Code ist Poesie in Aktion.'
          : 'Technologie ist nur so gut wie die Menschen, die sie nutzen. Heute machst du den Unterschied.',
        english: settings.quoteLength === 'oneliner'
          ? 'Any sufficiently advanced technology is indistinguishable from magic.'
          : 'The best time to plant a tree was 20 years ago. The second best time is now. The same applies to learning to code.',
        denglisch: settings.quoteLength === 'oneliner'
          ? 'Stay focused und git commit to success!'
          : 'Life is like a git repository - manchmal must du rebase, aber never give up on your branches! 😄'
      },
      success: {
        deutsch: settings.quoteLength === 'oneliner'
          ? 'Erfolg ist die Summe kleiner Anstrengungen.'
          : 'Erfolg ist nicht der Schlüssel zum Glück. Glück ist der Schlüssel zum Erfolg. Wenn du liebst was du tust, wirst du erfolgreich sein.',
        english: settings.quoteLength === 'oneliner'
          ? 'Success is where preparation meets opportunity.'
          : 'Success is not final, failure is not fatal: it is the courage to continue that counts.',
        denglisch: settings.quoteLength === 'oneliner'
          ? 'Fake it till you make it, aber mit Herzblut!'
          : 'Success is not about the destination, sondern about the journey. Und hey, enjoy the ride! 🚀'
      }
    };
    return quotes[settings.quoteTheme][settings.quoteLanguage];
  };

  const getTodayWorkload = () => {
    const todayTodos = todos.filter(todo => {
      if (!todo.due_date) return false;
      const today = new Date();
      const todoDate = new Date(todo.due_date);
      return todoDate.toDateString() === today.toDateString();
    });
    return todayTodos.length > 5 ? 'hoch' : todayTodos.length > 2 ? 'mittel' : 'niedrig';
  };

  const getDayOfWeek = () => {
    const days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    return days[new Date().getDay()];
  };

  const getContextualAdvice = () => {
    const day = new Date().getDay();
    const workload = getTodayWorkload();
    
    if (day === 1 && workload === 'hoch') return 'energisierende Motivation für einen starken Wochenstart';
    if (day === 5 && workload === 'niedrig') return 'entspannte Vibes für einen schönen Wochenabschluss';
    if (workload === 'hoch') return 'unterstützende Tipps für dein volles Programm';
    return 'inspirierende Gedanken für deinen Tag';
  };

  const sendTestEmail = async () => {
    await generatePreview();
    alert('Test-E-Mail wurde gesendet! 📧\n(In der echten App würde dies eine E-Mail an deine Adresse senden)');
  };

  return (
    <div className="daily-digest">
      <h2 className="digest-title">🎯 Daily Digest Einstellungen</h2>
      
      {/* Email Settings */}
      <div className="digest-section">
        <h3 className="section-title">📧 E-Mail Einstellungen</h3>
        <div className="setting-group">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.emailEnabled}
              onChange={(e) => updateSetting('emailEnabled', e.target.checked)}
            />
            <span className="checkbox-text">Tägliche E-Mail aktivieren</span>
          </label>
        </div>
        
        <div className="setting-group">
          <label>Lieferzeit:</label>
          <input
            type="time"
            value={settings.deliveryTime}
            onChange={(e) => updateSetting('deliveryTime', e.target.value)}
            className="time-input"
          />
          <span className="setting-hint">Jeden Tag um {settings.deliveryTime} Uhr</span>
        </div>
      </div>

      {/* Motivation Style */}
      <div className="digest-section">
        <h3 className="section-title">🎭 Motivationsstil</h3>
        <div className="motivation-grid">
          {Object.entries(motivationStyles).map(([key, style]) => (
            <div
              key={key}
              className={`motivation-card ${settings.motivationStyle === key ? 'selected' : ''}`}
              onClick={() => updateSetting('motivationStyle', key as MotivationStyle)}
            >
              <div className="motivation-emoji">{style.emoji}</div>
              <div className="motivation-name">{style.name}</div>
              <div className="motivation-example">{style.example}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Media Options */}
      <div className="digest-section">
        <h3 className="section-title">🎨 Media-Optionen</h3>
        
        <div className="setting-group">
          <label>Motivationstyp:</label>
          <div className="media-type-selector">
            <button 
              className={`media-btn ${settings.mediaType === 'quote' ? 'active' : ''}`}
              onClick={() => updateSetting('mediaType', 'quote')}
            >
              📝 Inspirational Quote
            </button>
            <button 
              className={`media-btn ${settings.mediaType === 'gif' ? 'active' : ''}`}
              onClick={() => updateSetting('mediaType', 'gif')}
            >
              🎬 Animated GIF
            </button>
            <button 
              className={`media-btn ${settings.mediaType === 'ai-image' ? 'active' : ''}`}
              onClick={() => updateSetting('mediaType', 'ai-image')}
            >
              🖼️ AI-Generated Image
            </button>
            <button 
              className={`media-btn ${settings.mediaType === 'surprise' ? 'active' : ''}`}
              onClick={() => updateSetting('mediaType', 'surprise')}
            >
              🎲 Surprise me!
            </button>
          </div>
        </div>

        {/* Quote Options */}
        {settings.mediaType === 'quote' && (
          <div className="media-options">
            <div className="option-row">
              <label>Thema:</label>
              <select
                value={settings.quoteTheme}
                onChange={(e) => updateSetting('quoteTheme', e.target.value as QuoteTheme)}
              >
                <option value="tech">Tech</option>
                <option value="success">Success</option>
                <option value="zen">Zen</option>
                <option value="funny">Funny</option>
                <option value="movies">Movies</option>
              </select>
            </div>
            <div className="option-row">
              <label>Sprache:</label>
              <select
                value={settings.quoteLanguage}
                onChange={(e) => updateSetting('quoteLanguage', e.target.value as QuoteLanguage)}
              >
                <option value="deutsch">Deutsch</option>
                <option value="english">English</option>
                <option value="denglisch">Denglisch 😄</option>
              </select>
            </div>
            <div className="option-row">
              <label>Länge:</label>
              <select
                value={settings.quoteLength}
                onChange={(e) => updateSetting('quoteLength', e.target.value as QuoteLength)}
              >
                <option value="oneliner">One-liner</option>
                <option value="paragraph">Paragraph</option>
              </select>
            </div>
          </div>
        )}

        {/* GIF Options */}
        {settings.mediaType === 'gif' && (
          <div className="media-options">
            <div className="option-row">
              <label>Stimmung:</label>
              <div className="gif-mood-selector">
                {['pumped', 'calm', 'funny', 'cute'].map(mood => (
                  <button
                    key={mood}
                    className={`mood-btn ${settings.gifMood === mood ? 'active' : ''}`}
                    onClick={() => updateSetting('gifMood', mood as GifMood)}
                  >
                    {mood === 'pumped' && '💪 Pumped'}
                    {mood === 'calm' && '😌 Calm'}
                    {mood === 'funny' && '😂 Funny'}
                    {mood === 'cute' && '🐱 Cute Animals'}
                  </button>
                ))}
              </div>
            </div>
            <div className="setting-hint">Quelle: Giphy API Integration</div>
          </div>
        )}

        {/* AI Image Options */}
        {settings.mediaType === 'ai-image' && (
          <div className="media-options">
            <div className="option-row">
              <label>Stil:</label>
              <select
                value={settings.imageStyle}
                onChange={(e) => updateSetting('imageStyle', e.target.value as ImageStyle)}
              >
                <option value="realistic">Realistic</option>
                <option value="cartoon">Cartoon</option>
                <option value="abstract">Abstract</option>
                <option value="anime">Anime</option>
              </select>
            </div>
            <div className="option-row">
              <label>Custom Prompt:</label>
              <input
                type="text"
                placeholder="Generate image with: ______"
                value={settings.customPrompt}
                onChange={(e) => updateSetting('customPrompt', e.target.value)}
                className="custom-prompt-input"
              />
              <div className="setting-hint">Oder smart prompt basierend auf Aufgaben verwenden</div>
            </div>
          </div>
        )}
      </div>

      {/* Content Preferences */}
      <div className="digest-section">
        <h3 className="section-title">📋 Inhalts-Einstellungen</h3>
        <div className="preferences-grid">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.includeOverdue}
              onChange={(e) => updateSetting('includeOverdue', e.target.checked)}
            />
            <span className="checkbox-text">Überfällige Aufgaben Warnung</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.showStats}
              onChange={(e) => updateSetting('showStats', e.target.checked)}
            />
            <span className="checkbox-text">Produktivitäts-Statistiken anzeigen</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.includeWeather}
              onChange={(e) => updateSetting('includeWeather', e.target.checked)}
            />
            <span className="checkbox-text">Wetter für Kontext einbeziehen</span>
          </label>
          
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={settings.aiRecommendations}
              onChange={(e) => updateSetting('aiRecommendations', e.target.checked)}
            />
            <span className="checkbox-text">KI-Aufgaben-Empfehlungen</span>
          </label>
        </div>
      </div>

      {/* Smart Context Mode */}
      <div className="digest-section">
        <h3 className="section-title">🧠 Smart Context Mode</h3>
        <label className="checkbox-label smart-context">
          <input
            type="checkbox"
            checked={settings.smartContext}
            onChange={(e) => updateSetting('smartContext', e.target.checked)}
          />
          <span className="checkbox-text">KI soll basierend auf folgendem wählen:</span>
        </label>
        {settings.smartContext && (
          <div className="smart-context-details">
            <div className="context-item">📊 Aufgabenlast (busy = energizing, light = relaxing)</div>
            <div className="context-item">📅 Wochentag (Monday motivation vs Friday celebration)</div>
            <div className="context-item">🌤️ Wetter (rainy day = extra motivation)</div>
            <div className="context-item">📈 Vergangene Produktivität (struggling = supportive)</div>
          </div>
        )}
      </div>

      {/* Preview Section */}
      <div className="digest-section">
        <h3 className="section-title">👀 Vorschau</h3>
        <div className="preview-controls">
          <button 
            className="preview-btn"
            onClick={generatePreview}
            disabled={isGeneratingPreview}
          >
            {isGeneratingPreview ? '⏳ Generiere...' : '🔍 Vorschau erstellen'}
          </button>
          <button 
            className="test-email-btn"
            onClick={sendTestEmail}
            disabled={!settings.emailEnabled}
          >
            📧 Test-E-Mail senden
          </button>
        </div>
        
        {previewEmail && (
          <div className="email-preview">
            <h4>📧 E-Mail Vorschau:</h4>
            <pre className="preview-content">{previewEmail}</pre>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="digest-actions">
        <button className="save-settings-btn">
          💾 Einstellungen speichern
        </button>
      </div>
    </div>
  );
};

export default DailyDigest;
