import React from 'react';
import Svg, {
    Path,
    G,
    Defs,
    Filter,
    FeFlood,
    FeColorMatrix,
    FeOffset,
    FeGaussianBlur,
    FeComposite,
    FeBlend,
    ClipPath,
    Rect
} from 'react-native-svg';

interface OperationsIconProps {
    size?: number;
    color?: string; // Для гибкости: вы можете передавать цвет
}

export const OperationsIcon: React.FC<OperationsIconProps> = ({
                                                                  size = 24,
                                                                  color = '#FFFFFF' // По умолчанию белый цвет для иконки
                                                              }) => {
    return (
        <Svg width={size} height={size} viewBox="0 0 30 30" fill="none">
            <G clipPath="url(#clip0_52_73)">
                <G filter="url(#filter0_d_52_73)">
                    <Path
                        d="M27.5 12.5V21.25C27.5 22.2446 27.1049 23.1984 26.4017 23.9017C25.6984 24.6049 24.7446 25 23.75 25H6.25C5.25544 25 4.30161 24.6049 3.59835 23.9017C2.89509 23.1984 2.5 22.2446 2.5 21.25V12.5H27.5ZM22.5 17.5H18.75C18.4185 17.5 18.1005 17.6317 17.8661 17.8661C17.6317 18.1005 17.5 18.4185 17.5 18.75C17.5 19.0815 17.6317 19.3995 17.8661 19.6339C18.1005 19.8683 18.4185 20 18.75 20H22.5C22.8315 20 23.1495 19.8683 23.3839 19.6339C23.6183 19.3995 23.75 19.0815 23.75 18.75C23.75 18.4185 23.6183 18.1005 23.3839 17.8661C23.1495 17.6317 22.8315 17.5 22.5 17.5ZM23.75 5C24.7446 5 25.6984 5.39509 26.4017 6.09835C27.1049 6.80161 27.5 7.75544 27.5 8.75V10H2.5V8.75C2.5 7.75544 2.89509 6.80161 3.59835 6.09835C4.30161 5.39509 5.25544 5 6.25 5H23.75Z"
                        fill={color} // Устанавливаем цвет для иконки (по умолчанию белый)
                    />
                </G>
            </G>

            <Defs>
                <Filter id="filter0_d_52_73" x="-1.5" y="5" width="33" height="28" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <FeFlood floodOpacity="0" result="BackgroundImageFix" />
                    <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
                    <FeOffset dy="4" />
                    <FeGaussianBlur stdDeviation="2" />
                    <FeComposite in2="hardAlpha" operator="out" />
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0" />
                    <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_52_73" />
                    <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_52_73" result="shape" />
                </Filter>
                <ClipPath id="clip0_52_73">
                    <Rect width="32" height="32" fill="none" />
                </ClipPath>
            </Defs>
        </Svg>
    );
};
