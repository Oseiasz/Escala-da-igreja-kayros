
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
      <div className={`${className} bg-zinc-200 dark:bg-zinc-900 rounded-full flex items-center justify-center`}>
        <UserIcon className="w-1/2 h-1/2 text-zinc-400 dark:text-zinc-700" />
      </div>
    );
  }

  if (member.avatar) {
    return <img src={member.avatar} alt={member.name} className={`${className} rounded-full object-cover bg-zinc-100 dark:bg-zinc-900`} />;
  }

  const initials = getInitials(member.name);
  const color = 'bg-zinc-900 dark:bg-white text-white dark:text-black';

  return (
    <div className={`${className} ${color} rounded-full flex items-center justify-center text-xs font-black tracking-tighter select-none`}>
      {initials}
    </div>
  );
};

export default Avatar;
