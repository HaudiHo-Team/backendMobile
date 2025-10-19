import React from 'react';
import Svg, {
    ClipPath,
    Defs,
    FeBlend,
    FeColorMatrix,
    FeComposite,
    FeFlood,
    FeGaussianBlur,
    FeOffset,
    Filter,
    G,
    Path, Rect
} from 'react-native-svg';

interface BellIconProps {
    size?: number;
    color?: string;
}

export const BellIcon: React.FC<BellIconProps> = ({
                                                      size = 24,
                                                      color = '#000000'
                                                  }) => {
    return (
        <Svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <G clipPath="url(#clip0_52_26)">
                <G filter="url(#filter0_d_52_26)">
                    <Path
                        d="M18.98 25.3333C20.1333 25.3333 20.7427 26.6987 19.9733 27.5573C19.4731 28.1161 18.8607 28.563 18.1761 28.8691C17.4914 29.1751 16.7499 29.3333 16 29.3333C15.2501 29.3333 14.5086 29.1751 13.8239 28.8691C13.1393 28.563 12.5269 28.1161 12.0267 27.5573C11.2907 26.736 11.816 25.452 12.872 25.3427L13.0187 25.3347L18.98 25.3333ZM16 2.66666C17.8107 2.66666 19.3413 3.87066 19.8333 5.52132L19.8947 5.74932L19.9053 5.80666C21.3754 6.63561 22.6281 7.80114 23.5607 9.20772C24.4933 10.6143 25.0793 12.2219 25.2707 13.8987L25.308 14.2813L25.3333 14.6667V18.5747L25.3613 18.756C25.5439 19.7384 26.0876 20.6169 26.8853 21.2187L27.108 21.3747L27.324 21.5067C28.4707 22.156 28.0707 23.8613 26.8213 23.992L26.6667 24H5.33333C3.96267 24 3.484 22.1813 4.676 21.5067C5.18404 21.2192 5.623 20.8239 5.96205 20.3487C6.30111 19.8736 6.53205 19.3299 6.63867 18.756L6.66667 18.5653L6.668 14.6053C6.7493 12.8638 7.25621 11.1688 8.14438 9.66861C9.03255 8.16842 10.2749 6.9088 11.7627 5.99999L12.0933 5.80532L12.1067 5.74799C12.2947 4.95043 12.7232 4.22987 13.3342 3.68378C13.9452 3.13769 14.7091 2.79242 15.5227 2.69466L15.7653 2.67199L16 2.66666Z"
                        fill="white"/>
                </G>
            </G>
            <Defs>
                <Filter id="filter0_d_52_26" x="-0.00253296" y="2.66666" width="32.005" height="34.6667"
                        filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                    <FeFlood floodOpacity="0" result="BackgroundImageFix"/>
                    <FeColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                   result="hardAlpha"/>
                    <FeOffset dy="4"/>
                    <FeGaussianBlur stdDeviation="2"/>
                    <FeComposite in2="hardAlpha" operator="out"/>
                    <FeColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.05 0"/>
                    <FeBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_52_26"/>
                    <FeBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_52_26" result="shape"/>
                </Filter>
                <ClipPath id="clip0_52_26">
                    <Rect width="32" height="32" fill="white"/>
                </ClipPath>
            </Defs>
        </Svg>
    );
};
