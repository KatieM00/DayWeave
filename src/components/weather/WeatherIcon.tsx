import React from 'react';

interface WeatherIconProps {
  condition: string;
  size?: number;
  className?: string;
}

// Brand colors
const COLORS = {
  primaryBlue: '#4A9CB8',
  brightYellow: '#FFD700',
  orangeAccent: '#FFA500',
  navy: '#2E5A6B',
  lightBlue: '#6aadc5',
  white: '#ffffff'
};

// OpenWeather API icon code mapping
const ICON_CODE_MAP: Record<string, string> = {
  // Clear sky
  '01d': 'sunny',
  '01n': 'clear-night',
  // Few clouds
  '02d': 'partly-cloudy',
  '02n': 'partly-cloudy-night',
  // Scattered clouds
  '03d': 'partly-cloudy',
  '03n': 'partly-cloudy-night',
  // Broken clouds
  '04d': 'cloudy',
  '04n': 'cloudy',
  // Shower rain
  '09d': 'heavy-rain',
  '09n': 'heavy-rain',
  // Rain
  '10d': 'light-rain',
  '10n': 'light-rain',
  // Thunderstorm
  '11d': 'thunderstorm',
  '11n': 'thunderstorm',
  // Snow
  '13d': 'snow',
  '13n': 'snow',
  // Mist
  '50d': 'fog',
  '50n': 'fog'
};

// Condition name mapping
const CONDITION_MAP: Record<string, string> = {
  'clear sky': 'sunny',
  'few clouds': 'partly-cloudy',
  'scattered clouds': 'partly-cloudy',
  'broken clouds': 'cloudy',
  'overcast clouds': 'cloudy',
  'light rain': 'light-rain',
  'moderate rain': 'light-rain',
  'heavy intensity rain': 'heavy-rain',
  'very heavy rain': 'heavy-rain',
  'extreme rain': 'heavy-rain',
  'freezing rain': 'sleet',
  'light intensity shower rain': 'drizzle',
  'shower rain': 'light-rain',
  'heavy intensity shower rain': 'heavy-rain',
  'ragged shower rain': 'heavy-rain',
  'thunderstorm': 'thunderstorm',
  'thunderstorm with light rain': 'thunderstorm',
  'thunderstorm with rain': 'thunderstorm',
  'thunderstorm with heavy rain': 'thunderstorm',
  'light thunderstorm': 'thunderstorm',
  'heavy thunderstorm': 'thunderstorm',
  'ragged thunderstorm': 'thunderstorm',
  'thunderstorm with light drizzle': 'thunderstorm',
  'thunderstorm with drizzle': 'thunderstorm',
  'thunderstorm with heavy drizzle': 'thunderstorm',
  'light intensity drizzle': 'drizzle',
  'drizzle': 'drizzle',
  'heavy intensity drizzle': 'drizzle',
  'light intensity drizzle rain': 'drizzle',
  'drizzle rain': 'drizzle',
  'heavy intensity drizzle rain': 'light-rain',
  'shower rain and drizzle': 'light-rain',
  'heavy shower rain and drizzle': 'heavy-rain',
  'shower drizzle': 'drizzle',
  'light snow': 'snow',
  'snow': 'snow',
  'heavy snow': 'blizzard',
  'sleet': 'sleet',
  'light shower sleet': 'sleet',
  'shower sleet': 'sleet',
  'light rain and snow': 'sleet',
  'rain and snow': 'sleet',
  'light shower snow': 'snow',
  'shower snow': 'snow',
  'heavy shower snow': 'blizzard',
  'mist': 'fog',
  'smoke': 'fog',
  'haze': 'fog',
  'sand/dust whirls': 'sandstorm',
  'fog': 'fog',
  'sand': 'sandstorm',
  'dust': 'sandstorm',
  'volcanic ash': 'fog',
  'squalls': 'windy',
  'tornado': 'tornado',
  'clear': 'sunny',
  'clouds': 'cloudy',
  'rain': 'light-rain',
  'snow': 'snow',
  'atmosphere': 'fog',
  'hot': 'hot',
  'cold': 'cold',
  'windy': 'windy',
  'hail': 'hail',
  'calm': 'sunny',
  'light breeze': 'windy',
  'gentle breeze': 'windy',
  'moderate breeze': 'windy',
  'fresh breeze': 'windy',
  'strong breeze': 'windy',
  'high wind': 'windy',
  'gale': 'windy',
  'severe gale': 'windy',
  'storm': 'windy',
  'violent storm': 'hurricane',
  'hurricane': 'hurricane'
};

// Individual icon components
const SunnyIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="8" fill={COLORS.brightYellow}/>
    <path d="M24 4V8M24 40V44M44 24H40M8 24H4M38.627 9.373L35.798 12.202M12.202 35.798L9.373 38.627M38.627 38.627L35.798 35.798M12.202 12.202L9.373 9.373" stroke={COLORS.brightYellow} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const ClearNightIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M32 12C28.5 8.5 23.5 8.5 20 12C16.5 15.5 16.5 20.5 20 24C23.5 27.5 28.5 27.5 32 24C35.5 20.5 35.5 15.5 32 12Z" fill={COLORS.primaryBlue}/>
    <path d="M28 16C26 14 23 14 21 16C19 18 19 21 21 23C23 25 26 25 28 23C30 21 30 18 28 16Z" fill={COLORS.navy}/>
    <circle cx="12" cy="10" r="1" fill={COLORS.brightYellow}/>
    <circle cx="38" cy="8" r="1.5" fill={COLORS.brightYellow}/>
    <circle cx="40" cy="20" r="1" fill={COLORS.brightYellow}/>
    <circle cx="8" cy="30" r="1" fill={COLORS.brightYellow}/>
    <circle cx="36" cy="36" r="1.5" fill={COLORS.brightYellow}/>
  </svg>
);

const PartlyCloudyIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="20" cy="20" r="6" fill={COLORS.brightYellow}/>
    <path d="M20 6V9M20 31V34M34 20H31M9 20H6M30.485 9.515L28.364 11.636M11.636 28.364L9.515 30.485" stroke={COLORS.brightYellow} strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 28C32 30.7614 29.7614 33 27 33H21C18.7909 33 17 31.2091 17 29C17 26.7909 18.7909 25 21 25C21.3453 25 21.6804 25.0368 22 25.1077C22.8956 23.8693 24.3478 23 26 23C28.2091 23 30 24.7909 30 27C31.1046 27 32 27.8954 32 29Z" fill={COLORS.primaryBlue}/>
  </svg>
);

const PartlyCloudyNightIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M22 18C20 16 17 16 15 18C13 20 13 23 15 25C17 27 20 27 22 25C24 23 24 20 22 18Z" fill={COLORS.primaryBlue}/>
    <path d="M32 28C32 30.7614 29.7614 33 27 33H21C18.7909 33 17 31.2091 17 29C17 26.7909 18.7909 25 21 25C21.3453 25 21.6804 25.0368 22 25.1077C22.8956 23.8693 24.3478 23 26 23C28.2091 23 30 24.7909 30 27C31.1046 27 32 27.8954 32 29Z" fill={COLORS.primaryBlue}/>
    <circle cx="12" cy="12" r="0.8" fill={COLORS.brightYellow}/>
    <circle cx="26" cy="10" r="0.8" fill={COLORS.brightYellow}/>
    <circle cx="30" cy="16" r="0.8" fill={COLORS.brightYellow}/>
  </svg>
);

const CloudyIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M38 32C38 35.3137 35.3137 38 32 38H16C12.6863 38 10 35.3137 10 32C10 28.6863 12.6863 26 16 26C16.5523 26 17.0896 26.0717 17.6006 26.2084C19.0773 23.8007 21.4765 22.1818 24.2857 22.0182C27.095 21.8546 29.6491 23.1677 31.4286 25.4286C33.2081 27.6895 33.9714 30.6364 33.5143 33.5143C35.4762 32.7619 38 33.9524 38 32Z" fill={COLORS.primaryBlue}/>
    <path d="M28 18C28 20.7614 25.7614 23 23 23H14C11.2386 23 9 20.7614 9 18C9 15.2386 11.2386 13 14 13C14.3453 13 14.6804 13.0368 15 13.1077C15.8956 11.8693 17.3478 11 19 11C21.2091 11 23 12.7909 23 15C24.1046 15 25 15.8954 25 17C26.6569 17 28 18.3431 28 18Z" fill={COLORS.lightBlue} opacity="0.7"/>
  </svg>
);

const LightRainIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.primaryBlue}/>
    <path d="M18 36L19 40M25 36L26 40M32 36L33 40" stroke={COLORS.primaryBlue} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const HeavyRainIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.navy}/>
    <path d="M16 36L18 42M22 34L24 40M28 36L30 42M34 34L36 40" stroke={COLORS.primaryBlue} strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

const DrizzleIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M34 28C34 30.2091 32.2091 32 30 32H20C18.3431 32 17 30.6569 17 29C17 27.3431 18.3431 26 20 26C20.2761 26 20.5401 26.0315 20.7906 26.0906C21.4765 25.0315 22.6499 24.3333 24 24.3333C25.8409 24.3333 27.3333 25.8257 27.3333 27.6667C28.1577 27.6667 28.8333 28.3423 28.8333 29.1667C30.1212 29.1667 31.1667 30.2121 31.1667 31.5" fill={COLORS.lightBlue}/>
    <circle cx="20" cy="36" r="1" fill={COLORS.primaryBlue}/>
    <circle cx="24" cy="38" r="1" fill={COLORS.primaryBlue}/>
    <circle cx="28" cy="36" r="1" fill={COLORS.primaryBlue}/>
    <circle cx="32" cy="38" r="1" fill={COLORS.primaryBlue}/>
  </svg>
);

const ThunderstormIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.navy}/>
    <path d="M20 34L18 38L20 40L18 44M28 34L26 38L28 40L26 44" stroke={COLORS.brightYellow} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M22 36L23 39M32 36L33 39" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SnowIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.lightBlue}/>
    <path d="M18 38L18 42M16 40L20 40M17 39L19 41M17 41L19 39" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M25 36L25 40M23 38L27 38M24 37L26 39M24 39L26 37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M32 38L32 42M30 40L34 40M31 39L33 41M31 41L33 39" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const SleetIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.lightBlue}/>
    <path d="M18 36L19 40" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="25" cy="38" r="1.5" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1"/>
    <path d="M32 36L33 40" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round"/>
    <circle cx="21" cy="42" r="1.5" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1"/>
    <path d="M29 38L30 42" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const FogIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 18H40M8 24H36M12 30H40M8 36H32" stroke={COLORS.lightBlue} strokeWidth="3" strokeLinecap="round" opacity="0.6"/>
    <path d="M12 21H36M12 27H32M16 33H36M12 39H28" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round" opacity="0.8"/>
  </svg>
);

const WindyIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M8 16C8 16 12 12 16 12C20 12 24 16 24 16" stroke={COLORS.primaryBlue} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M8 24C8 24 14 20 20 20C26 20 32 24 32 24" stroke={COLORS.primaryBlue} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M8 32C8 32 16 28 24 28C32 28 40 32 40 32" stroke={COLORS.primaryBlue} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <circle cx="16" cy="12" r="2" fill={COLORS.brightYellow}/>
    <circle cx="20" cy="20" r="2" fill={COLORS.brightYellow}/>
    <circle cx="24" cy="28" r="2" fill={COLORS.brightYellow}/>
  </svg>
);

const HotIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="10" fill={COLORS.brightYellow}/>
    <path d="M24 2V6M24 42V46M46 24H42M6 24H2M40.627 7.373L37.798 10.202M10.202 37.798L7.373 40.627M40.627 40.627L37.798 37.798M10.202 10.202L7.373 7.373" stroke={COLORS.orangeAccent} strokeWidth="3" strokeLinecap="round"/>
    <circle cx="24" cy="24" r="6" fill="none" stroke={COLORS.orangeAccent} strokeWidth="2"/>
    <circle cx="24" cy="24" r="3" fill={COLORS.orangeAccent}/>
  </svg>
);

const ColdIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="32" r="6" fill={COLORS.primaryBlue}/>
    <rect x="21" y="8" width="6" height="24" fill={COLORS.primaryBlue} rx="3"/>
    <path d="M24 8V4M18 12H12M30 12H36M18 20H14M30 20H34" stroke={COLORS.primaryBlue} strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="24" cy="32" r="3" fill="white"/>
    <path d="M18 42L20 44M20 42L18 44M28 42L30 44M30 42L28 44" stroke={COLORS.primaryBlue} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const HailIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.navy}/>
    <circle cx="18" cy="38" r="2" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1.5"/>
    <circle cx="25" cy="36" r="2" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1.5"/>
    <circle cx="32" cy="38" r="2" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1.5"/>
    <circle cx="21" cy="42" r="2" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1.5"/>
    <circle cx="29" cy="41" r="2" fill="white" stroke={COLORS.primaryBlue} strokeWidth="1.5"/>
  </svg>
);

const TornadoIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 14C36 16.7614 33.7614 19 31 19H25C22.7909 19 21 17.2091 21 15C21 12.7909 22.7909 11 25 11C25.3453 11 25.6804 11.0368 26 11.1077C26.8956 9.8693 28.3478 9 30 9C32.2091 9 34 10.7909 34 13C35.1046 13 36 13.8954 36 15" fill={COLORS.navy}/>
    <path d="M22 20C20 20 18 22 18 24C18 26 20 28 22 28" stroke={COLORS.primaryBlue} strokeWidth="3" strokeLinecap="round" fill="none"/>
    <path d="M20 28C18 28 16 30 16 32C16 34 18 36 20 36" stroke={COLORS.primaryBlue} strokeWidth="2.5" strokeLinecap="round" fill="none"/>
    <path d="M18 36C16 36 14 38 14 40C14 42 16 44 18 44" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const HurricaneIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="20" fill="none" stroke={COLORS.navy} strokeWidth="3"/>
    <path d="M8 24C8 24 12 16 20 16C28 16 32 24 32 24C32 24 28 32 20 32C12 32 8 24 8 24Z" fill={COLORS.primaryBlue}/>
    <circle cx="24" cy="24" r="4" fill="white"/>
    <path d="M40 20C36 18 32 20 30 24M8 28C12 30 16 28 18 24" stroke={COLORS.lightBlue} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

const SandstormIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M6 20C10 16 16 16 20 20M6 28C10 24 16 24 20 28M6 36C10 32 16 32 20 36" stroke={COLORS.orangeAccent} strokeWidth="3" strokeLinecap="round" opacity="0.8"/>
    <path d="M28 18C32 14 38 14 42 18M28 26C32 22 38 22 42 26M28 34C32 30 38 30 42 34" stroke={COLORS.brightYellow} strokeWidth="2.5" strokeLinecap="round" opacity="0.9"/>
    <circle cx="12" cy="16" r="1.5" fill={COLORS.orangeAccent}/>
    <circle cx="20" cy="24" r="2" fill={COLORS.brightYellow}/>
    <circle cx="16" cy="32" r="1.5" fill={COLORS.orangeAccent}/>
    <circle cx="36" cy="20" r="1.5" fill={COLORS.brightYellow}/>
    <circle cx="32" cy="30" r="2" fill={COLORS.orangeAccent}/>
  </svg>
);

const AuroraIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M12 44C12 38 8 32 12 26C16 20 20 26 24 20C28 14 32 20 36 14C40 8 44 14 44 20" stroke={COLORS.primaryBlue} strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.8"/>
    <path d="M8 40C8 36 6 32 8 28C10 24 12 28 14 24C16 20 18 24 20 20C22 16 24 20 26 16" stroke={COLORS.lightBlue} strokeWidth="2.5" strokeLinecap="round" fill="none" opacity="0.9"/>
    <path d="M16 42C16 38 14 34 16 30C18 26 20 30 22 26C24 22 26 26 28 22" stroke={COLORS.brightYellow} strokeWidth="2" strokeLinecap="round" fill="none" opacity="0.7"/>
    <circle cx="12" cy="8" r="1" fill={COLORS.brightYellow}/>
    <circle cx="20" cy="6" r="1.5" fill={COLORS.brightYellow}/>
    <circle cx="28" cy="8" r="1" fill={COLORS.brightYellow}/>
    <circle cx="36" cy="6" r="1.5" fill={COLORS.brightYellow}/>
  </svg>
);

const RainbowIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="20" cy="20" r="6" fill={COLORS.brightYellow}/>
    <path d="M20 6V9M20 31V34M34 20H31M9 20H6" stroke={COLORS.brightYellow} strokeWidth="2" strokeLinecap="round"/>
    <path d="M32 28C32 30.7614 29.7614 33 27 33H21C18.7909 33 17 31.2091 17 29C17 26.7909 18.7909 25 21 25C21.3453 25 21.6804 25.0368 22 25.1077C22.8956 23.8693 24.3478 23 26 23C28.2091 23 30 24.7909 30 27C31.1046 27 32 27.8954 32 29Z" fill={COLORS.lightBlue}/>
    <path d="M8 44C8 36 14 30 22 30C30 30 36 36 36 44" stroke={COLORS.brightYellow} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M10 44C10 37 15 32 22 32C29 32 34 37 34 44" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round" fill="none"/>
    <path d="M12 44C12 38 16 34 22 34C28 34 32 38 32 44" stroke={COLORS.lightBlue} strokeWidth="2" strokeLinecap="round" fill="none"/>
  </svg>
);

const HumidIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <circle cx="24" cy="24" r="8" fill={COLORS.brightYellow}/>
    <path d="M24 4V8M24 40V44M44 24H40M8 24H4" stroke={COLORS.brightYellow} strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M16 36C16 37.1046 16.8954 38 18 38C19.1046 38 20 37.1046 20 36C20 34.8954 19.1046 34 18 34C16.8954 34 16 34.8954 16 36Z" fill={COLORS.primaryBlue}/>
    <path d="M28 38C28 39.1046 28.8954 40 30 40C31.1046 40 32 39.1046 32 38C32 36.8954 31.1046 36 30 36C28.8954 36 28 36.8954 28 38Z" fill={COLORS.primaryBlue}/>
    <path d="M34 32C34 33.1046 34.8954 34 36 34C37.1046 34 38 33.1046 38 32C38 30.8954 37.1046 30 36 30C34.8954 30 34 30.8954 34 32Z" fill={COLORS.primaryBlue}/>
  </svg>
);

const BlizzardIcon: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 48 48" fill="none">
    <path d="M36 28C36 30.7614 33.7614 33 31 33H19C16.7909 33 15 31.2091 15 29C15 26.7909 16.7909 25 19 25C19.3453 25 19.6804 25.0368 20 25.1077C20.8956 23.8693 22.3478 23 24 23C26.2091 23 28 24.7909 28 27C29.1046 27 30 27.8954 30 29C32.2091 29 34 30.7909 34 33C35.1046 33 36 33.8954 36 35" fill={COLORS.navy}/>
    <path d="M18 38L18 42M16 40L20 40M17 39L19 41M17 41L19 39" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M25 36L25 40M23 38L27 38M24 37L26 39M24 39L26 37" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M32 38L32 42M30 40L34 40M31 39L33 41M31 41L33 39" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M14 20C18 16 22 20 26 16M28 24C32 20 36 24 40 20" stroke={COLORS.primaryBlue} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

// Icon mapping object
const WEATHER_ICONS: Record<string, React.FC<{ size: number }>> = {
  'sunny': SunnyIcon,
  'clear-night': ClearNightIcon,
  'partly-cloudy': PartlyCloudyIcon,
  'partly-cloudy-night': PartlyCloudyNightIcon,
  'cloudy': CloudyIcon,
  'light-rain': LightRainIcon,
  'heavy-rain': HeavyRainIcon,
  'drizzle': DrizzleIcon,
  'thunderstorm': ThunderstormIcon,
  'snow': SnowIcon,
  'sleet': SleetIcon,
  'fog': FogIcon,
  'windy': WindyIcon,
  'hot': HotIcon,
  'cold': ColdIcon,
  'hail': HailIcon,
  'tornado': TornadoIcon,
  'hurricane': HurricaneIcon,
  'sandstorm': SandstormIcon,
  'aurora': AuroraIcon,
  'rainbow': RainbowIcon,
  'humid': HumidIcon,
  'blizzard': BlizzardIcon
};

// Main WeatherIcon component
const WeatherIcon: React.FC<WeatherIconProps> = ({ 
  condition, 
  size = 48, 
  className = '' 
}) => {
  // Normalize the condition string
  const normalizedCondition = condition.toLowerCase().trim();
  
  // Try to map from OpenWeather icon code first
  let iconType = ICON_CODE_MAP[normalizedCondition];
  
  // If not found, try condition name mapping
  if (!iconType) {
    iconType = CONDITION_MAP[normalizedCondition];
  }
  
  // If still not found, try partial matching for common patterns
  if (!iconType) {
    if (normalizedCondition.includes('rain') && normalizedCondition.includes('heavy')) {
      iconType = 'heavy-rain';
    } else if (normalizedCondition.includes('rain')) {
      iconType = 'light-rain';
    } else if (normalizedCondition.includes('snow') && normalizedCondition.includes('heavy')) {
      iconType = 'blizzard';
    } else if (normalizedCondition.includes('snow')) {
      iconType = 'snow';
    } else if (normalizedCondition.includes('thunder')) {
      iconType = 'thunderstorm';
    } else if (normalizedCondition.includes('cloud')) {
      iconType = 'cloudy';
    } else if (normalizedCondition.includes('clear') || normalizedCondition.includes('sunny')) {
      iconType = 'sunny';
    } else if (normalizedCondition.includes('fog') || normalizedCondition.includes('mist')) {
      iconType = 'fog';
    } else if (normalizedCondition.includes('wind')) {
      iconType = 'windy';
    } else {
      // Default fallback
      iconType = 'partly-cloudy';
    }
  }
  
  const IconComponent = WEATHER_ICONS[iconType];
  
  if (!IconComponent) {
    console.warn(`Weather icon not found for condition: ${condition}, using fallback`);
    return <PartlyCloudyIcon size={size} />;
  }
  
  return (
    <div className={`inline-flex items-center justify-center ${className}`}>
      <IconComponent size={size} />
    </div>
  );
};

export default WeatherIcon;