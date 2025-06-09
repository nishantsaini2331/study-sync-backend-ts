import { SocialInterFace } from "../interfaces/user.interface";

interface SocialPlatformPatterns {
  youtube: RegExp;
  linkedin: RegExp;
  github: RegExp;
  website: RegExp;
  twitter: RegExp;
}

export function validateSocialLinks(socials: SocialInterFace): {
  isValid: boolean;
  message?: string;
} {
  const patterns: SocialPlatformPatterns = {
    youtube: /^(https?:\/\/)?(www\.)?youtube\.com\/@[a-zA-Z0-9._-]+$/,
    linkedin: /^(https?:\/\/)?(www\.)?linkedin\.com\/in\/[a-zA-Z0-9_-]+\/?$/,
    github: /^(https?:\/\/)?(www\.)?github\.com\/[a-zA-Z0-9_-]+\/?$/,
    website: /^(https?:\/\/)?(www\.)?[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    twitter:
      /^(https?:\/\/)?(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]{1,15}\/?$/,
  };

  for (const [platform, url] of Object.entries(socials)) {
    if (!url || url.trim() === "") continue;

    // Narrow platform type
    if (!Object.keys(patterns).includes(platform)) {
      return {
        isValid: false,
        message: `Unsupported social media platform: ${platform}`,
      };
    }

    const typedPlatform = platform as keyof typeof patterns;

    if (!patterns[typedPlatform].test(url)) {
      return {
        isValid: false,
        message: `Invalid ${platform} URL format`,
      };
    }
  }

  return { isValid: true };
}
