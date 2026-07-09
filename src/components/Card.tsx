import React, { useState } from 'react';
import { Share2 } from 'lucide-react';
import { NewsItem } from '../types';

function getCategoryThumbnail(category: string, headline: string): string {
  const normCat = category.toLowerCase();
  
  // Use a simple hash code of the headline to select a sub-image for natural McKinsey/Bain style dynamic variety!
  let hash = 0;
  for (let i = 0; i < headline.length; i++) {
    hash = headline.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % 3;

  const images: Record<string, string[]> = {
    regulation: [
      "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&h=330&q=80", // corporate study
      "https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=600&h=330&q=80", // abstract order pillars
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=600&h=330&q=80"  // elegant legal scale
    ],
    card: [
      "https://images.unsplash.com/photo-1563013544-824ae1d704d3?auto=format&fit=crop&w=600&h=330&q=80", // premium card setup
      "https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=600&h=330&q=80", // modern digital checkout
      "https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=600&h=330&q=80"  // mobile banking preview
    ],
    upi: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=600&h=330&q=80", // strategy financial charts
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=600&h=330&q=80", // high end telemetry screens
      "https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?auto=format&fit=crop&w=600&h=330&q=80"  // precision financial indicators
    ],
    gateway: [
      "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=600&h=330&q=80", // programming workspace console
      "https://images.unsplash.com/photo-1600132806370-bf17e65e942f?auto=format&fit=crop&w=600&h=330&q=80", // modern blueprint flow
      "https://images.unsplash.com/photo-1504868584819-f8e8b4b6d7e3?auto=format&fit=crop&w=600&h=330&q=80"  // corporate database analytics
    ],
    ai: [
      "https://images.unsplash.com/photo-1527474305487-b87b222841cc?auto=format&fit=crop&w=600&h=330&q=80", // abstract light paths
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&h=330&q=80", // high-contrast abstract layers
      "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=600&h=330&q=80"  // biometric vector node block
    ],
    crossborder: [
      "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=600&h=330&q=80", // digital earth connectivity
      "https://images.unsplash.com/photo-1507537297725-24a1c029d3ca?auto=format&fit=crop&w=600&h=330&q=80", // business team worldwide operations
      "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&h=330&q=80"  // matrix and global tech networks
    ],
    default: [
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&h=330&q=80", // glass skyscraper building exterior
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=600&h=330&q=80", // corporate conference interior
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=600&h=330&q=80"  // elegant business consulting pose
    ]
  };

  let list = images.default;
  if (normCat.includes('regulation') || normCat.includes('compliance')) {
    list = images.regulation;
  } else if (normCat.includes('card') || normCat.includes('issuing')) {
    list = images.card;
  } else if (normCat.includes('upi') || normCat.includes('rails')) {
    list = images.upi;
  } else if (normCat.includes('gate') || normCat.includes('auth')) {
    list = images.gateway;
  } else if (normCat.includes('ai') || normCat.includes('fraud') || normCat.includes('prevention')) {
    list = images.ai;
  } else if (normCat.includes('cross') || normCat.includes('fx') || normCat.includes('border')) {
    list = images.crossborder;
  }

  return list[index];
}

interface CardProps {
  item: NewsItem;
  key?: React.Key;
  onSave?: (item: NewsItem) => void;
  onView?: (item: NewsItem) => void;
  searchTerm?: string;
}

function Highlight({ text, term }: { text: string; term?: string }) {
  if (!term || term.trim() === '') return <>{text}</>;
  const regex = new RegExp(`(${term})`, 'gi');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === term.toLowerCase() ? (
          <span key={i} className="bg-indigo-900/50 text-indigo-300">
            {part}
          </span>
        ) : (
          part
        )
      )}
    </>
  );
}

export default function Card({ item, onSave, onView, searchTerm }: CardProps) {
  const [view, setView] = useState<'strategic' | 'technical'>('strategic');

  const handleViewChange = (newView: 'strategic' | 'technical') => {
    setView(newView);
    if (onView) onView(item);
  };

  const content = item.headline + " " + item.summary + " " + item.strategicView + " " + item.technicalView + " " + item.expertInsights;
  const readTime = Math.ceil(content.split(/\s+/).length / 225);

  const copyShareLink = () => {
    navigator.clipboard.writeText(window.location.origin + window.location.pathname + '#article-' + item.headline.replace(/\s+/g, '-').toLowerCase());
  };

  const thumbnailSrc = getCategoryThumbnail(item.category, item.headline);

  return (
    <div className="bg-white border border-gray-200 p-5 flex flex-col hover:border-indigo-300 transition-all duration-300 rounded-sm">
      {/* McKinsey / BCG Style Thought Leadership Cover Thumbnails */}
      <div className="relative w-full aspect-[16/10] mb-4 overflow-hidden bg-gray-50 border border-gray-100 rounded-sm group select-none">
        <img 
          src={thumbnailSrc} 
          alt={item.headline}
          className="w-full h-full object-cover filter grayscale-[10%] brightness-[95%] contrast-[105%] hover:scale-[1.03] hover:grayscale-0 transition-all duration-500" 
          referrerPolicy="no-referrer"
        />
        <div className="absolute top-2 left-2">
          <span className="bg-gray-900/90 backdrop-blur-xs text-white text-[9px] px-2 py-0.5 tracking-wider uppercase font-black rounded-sm shadow-sm border border-gray-800">
            {item.category}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-[10px] uppercase font-bold tracking-wider">
            {readTime} min read
          </span>
        </div>
        <div className="flex bg-gray-100 rounded-full p-1 border border-gray-200">
          <button
            onClick={() => handleViewChange('strategic')}
            className={`px-2 py-1 text-[9px] font-bold uppercase transition ${view === 'strategic' ? 'bg-indigo-600 text-white rounded-full' : 'text-gray-500'}`}
          >
            Strategic
          </button>
          <button
            onClick={() => handleViewChange('technical')}
            className={`px-2 py-1 text-[9px] font-bold uppercase transition ${view === 'technical' ? 'bg-indigo-600 text-white rounded-full' : 'text-gray-500'}`}
          >
            Technical
          </button>
        </div>
      </div>
      <h3 className="text-gray-900 text-lg font-bold leading-tight mb-3 tracking-tight">
        <Highlight text={item.headline} term={searchTerm} />
      </h3>
      <p className="text-sm text-gray-600 mb-6 leading-relaxed italic">
        <Highlight text={item.summary} term={searchTerm} />
      </p>
      
      <div className="flex-1 border-t border-gray-100 pt-4">
        <div className="grid grid-cols-2 gap-2 text-[9px] mb-4 text-gray-500">
           <div>Issuers: <span className="font-bold text-gray-700">{item.stakeholderImpact.issuers}</span></div>
           <div>Acquirers: <span className="font-bold text-gray-700">{item.stakeholderImpact.acquirers}</span></div>
           <div>Networks: <span className="font-bold text-gray-700">{item.stakeholderImpact.networks}</span></div>
           <div>Fintechs: <span className="font-bold text-gray-700">{item.stakeholderImpact.fintechs}</span></div>
        </div>
        <div className="text-[10px] text-indigo-600 font-bold uppercase mb-2">
          {view === 'strategic' ? "Trisha's 2 Cents" : "Corporate Impact Desk"}
        </div>
        <div className="text-xs leading-relaxed text-gray-700 mb-4">
          {view === 'strategic' ? item.strategicView : item.technicalView}
        </div>
        {view === 'strategic' && (
          <>
            <div className="text-[10px] text-emerald-600 font-bold uppercase mb-2">Expert Insights</div>
            <div className="text-xs leading-relaxed text-gray-600 bg-gray-100 p-3 rounded">{item.expertInsights}</div>
          </>
        )}
      </div>
      <div className="flex gap-2 mt-4">
        {item.sourceLink && (
          <a
            href={item.sourceLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[10px] font-bold uppercase px-3 py-2 transition border border-indigo-100 rounded-sm"
            title={`Read Press Release on ${item.sourceName || 'Source'}`}
          >
            <span>🔗</span> <span>{item.sourceName ? item.sourceName.toUpperCase() : 'PRESS RELEASE'}</span>
          </a>
        )}
        <button
          onClick={copyShareLink}
          className="bg-gray-100 text-gray-500 p-2 hover:bg-gray-200 hover:text-gray-900 transition rounded-sm"
          title="Copy share link"
        >
          <Share2 size={18} />
        </button>
        {onSave && (
          <button
            onClick={() => onSave(item)}
            className="flex-1 bg-gray-800 text-white text-xs font-bold uppercase py-2 hover:bg-gray-700 transition rounded-sm"
          >
            Save for Later
          </button>
        )}
      </div>
    </div>
  );
}
