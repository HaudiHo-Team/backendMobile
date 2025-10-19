import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';

interface BotAvatarIconProps {
  size?: number;
  color?: string;
}

export const BotAvatarIcon: React.FC<BotAvatarIconProps> = ({ 
  size = 24, 
  color = '#000000' 
}) => {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      {/* Голова робота */}
      <Circle
        cx="12"
        cy="8"
        r="6"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Тело робота */}
      <Path
        d="M6 14H18C18.5304 14 19.0391 14.2107 19.4142 14.5858C19.7893 14.9609 20 15.4696 20 16V20C20 20.5304 19.7893 21.0391 19.4142 21.4142C19.0391 21.7893 18.5304 22 18 22H6C5.46957 22 4.96086 21.7893 4.58579 21.4142C4.21071 21.0391 4 20.5304 4 20V16C4 15.4696 4.21071 14.9609 4.58579 14.5858C4.96086 14.2107 5.46957 14 6 14Z"
        stroke={color}
        strokeWidth="2"
        fill="none"
      />
      {/* Глаза */}
      <Circle cx="9" cy="7" r="1" fill={color} />
      <Circle cx="15" cy="7" r="1" fill={color} />
      {/* Антенна */}
      <Path
        d="M12 2V4"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <Circle cx="12" cy="2" r="1" fill={color} />
    </Svg>
  );
};