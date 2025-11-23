import React from 'react';
import { Member } from '../types';
import { UserIcon } from './icons';

const getInitials = (name: string = '') => {
    if (!name) return '';
    const names = name.split(' ').filter(Boolean);
    if (names.length === 0) return '';
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
};

interface AvatarProps {
  member: Member | null;
  className?: string;
}

const Avatar: React.FC<AvatarProps> = ({ member, className = 'w-10 h-10' }) => {
  if (!member) {
    return (
      <div className={`${className} bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center`}>
        <UserIcon className="w-1/2 h-1/2 text-slate-400 dark:text-slate-500" />
      </div>
    );
  }

  if (member.avatar) {
    return <img src={member.avatar} alt={member.name} className={`${className} rounded-full object-cover bg-slate-200 dark:bg-slate-700`} />;
  }

  const initials = getInitials(member.name);
  // Simple color hashing for variety
  const charCodeSum = member.name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const colors = ['bg-indigo-500', 'bg-blue-500', 'bg-emerald-500', 'bg-amber-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500'];
  const color = colors[charCodeSum % colors.length];

  const widthClass = className.split(' ').find(c => c.startsWith('w-'));
  let fontSizeRem = 1; // default font size in rem
  if (widthClass) {
      const widthUnit = parseInt(widthClass.substring(2).split('/')[0]); // Handles w-full, w-1/2 etc.
      if (!isNaN(widthUnit)) {
          // w-10 is 2.5rem, so font size should be ~1rem (ratio 2.5)
          // w-24 is 6rem, so font size should be ~2.4rem (ratio 2.5)
          // w-6 is 1.5rem (24px). Font size should be ~0.6rem (10px).
          fontSizeRem = (widthUnit * 0.25) / 2.5;
      }
  }


  return (
    <div 
        className={`${className} ${color} rounded-full flex items-center justify-center text-white font-bold leading-none select-none`} 
        style={{ fontSize: `${fontSizeRem}rem`}}
    >
      {initials}
    </div>
  );
};

export default Avatar;