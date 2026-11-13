import type { AvatarPlacement } from '../components/AvatarCutout';

export interface PortfolioSlide {
  id: string;
  index: string;
  navLabel: string;
  title: string;
  src: string;
  alt: string;
  aspectRatio: string;
  avatar?: AvatarPlacement;
}

export const VIDEO_ASSET = {
  src: '/assets/aistudio/Siddartha_Reddy_Portfolio_Video_5d1e6a3a.mp4',
  poster: '/assets/aistudio/Portfolio_1st_page_d898973d.jpeg',
  width: 1280,
  height: 720,
  durationSeconds: 10,
  fps: 24,
  totalFrames: 240,
  framePattern: (frameIndex: number) =>
    `/assets/frames/frame_${String(frameIndex + 1).padStart(3, '0')}.webp`,
} as const;

export const PORTFOLIO_SLIDES: PortfolioSlide[] = [
  {
    id: 'hero-slide',
    index: '01',
    navLabel: 'Hero',
    title: 'Introduction',
    src: '/assets/aistudio/Portfolio_1st_page_d898973d.jpeg',
    alt: 'Siddartha Reddy — Introduction portfolio slide showcasing experience, skills in Python, Java, SQL, and Agentic AI, and contact location in Anantapur, Andhra Pradesh',
    aspectRatio: '1600 / 890',
  },
  {
    id: 'about-slide',
    index: '02',
    navLabel: 'About',
    title: 'About Me',
    src: '/assets/aistudio/ABOUT_ME_2nd_page_d96600aa.png',
    alt: 'Siddartha Reddy — About Me portfolio slide detailing AI & Machine Learning focus, backend engineering, and core traits: Problem Solver, Creative Thinker, Continuous Learner',
    aspectRatio: '1688 / 932',
    avatar: {
      src: '/assets/aistudio/image_20ae279a.png',
      alt: 'Siddartha Reddy avatar on About Me slide',
      left: '46.5%',
      bottom: '0%',
      width: '27%',
    },
  },
  {
    id: 'skills-slide',
    index: '03',
    navLabel: 'Skills',
    title: 'Skills',
    src: '/assets/aistudio/Skills_3rd_page_ff43bbea.png',
    alt: 'Siddartha Reddy — Skills portfolio slide covering Programming (Python, Java), Databases (MySQL, Supabase), Frameworks (Spring Boot, Django, Thymeleaf), and Tools (Git, GitHub, Maven)',
    aspectRatio: '1688 / 932',
    avatar: {
      src: '/assets/aistudio/image_89e81abf.png',
      alt: 'Siddartha Reddy avatar on Skills slide',
      right: '2.5%',
      bottom: '0%',
      width: '28%',
    },
  },
  {
    id: 'projects-slide',
    index: '04',
    navLabel: 'Projects',
    title: 'Projects',
    src: '/assets/aistudio/Projects_4th_page_e7071996.png',
    alt: 'Siddartha Reddy — Projects portfolio slide featuring Jain-Transit, Climate Detector, and AI Trip Planner',
    aspectRatio: '1688 / 932',
    avatar: {
      src: '/assets/aistudio/image_f730518a.png',
      alt: 'Siddartha Reddy avatar on Projects slide',
      right: '4%',
      bottom: '0%',
      width: '31%',
    },
  },
  {
    id: 'education-slide',
    index: '05',
    navLabel: 'Education',
    title: 'Education',
    src: '/assets/aistudio/Education_5th_page_de910b0f.jpeg',
    alt: 'Siddartha Reddy — Education portfolio slide detailing B.Tech in AI & ML at Jain University Bangalore, Sri Chaitanya Junior College, and Era International School',
    aspectRatio: '1600 / 881',
    avatar: {
      src: '/assets/aistudio/image_2a07c30d.png',
      alt: 'Siddartha Reddy avatar on Education slide',
      right: '2.5%',
      bottom: '0%',
      width: '45%',
    },
  },
  {
    id: 'achievements-slide',
    index: '06',
    navLabel: 'Achievements',
    title: 'Achievements',
    src: '/assets/aistudio/Achievements_6th_page_855df7b9.png',
    alt: 'Siddartha Reddy — Achievements portfolio slide highlighting Java Internship at 1Stop.ai, AI & ML NSDC, Python with AI NSDC, and AI Tools Workshop',
    aspectRatio: '1688 / 932',
    avatar: {
      src: '/assets/aistudio/image_a92b1bd8.png',
      alt: 'Siddartha Reddy avatar on Achievements slide',
      right: '6%',
      bottom: '9.5%',
      width: '32%',
      softBottomFade: true,
    },
  },
];

export const NAV_SECTIONS = [
  { id: 'intro-video', label: 'Intro', shortIndex: '00' },
  ...PORTFOLIO_SLIDES.map((s) => ({
    id: s.id,
    label: s.navLabel,
    shortIndex: s.index,
  })),
];

export const CONTACT_INFO = {
  name: 'Siddartha Reddy',
  subtitle: 'AI & ML · Backend Engineering · Agentic AI',
  location: 'Anantapur, Andhra Pradesh',
  phone: '+91 7995341715',
  email: 'siddarthareddy380@gmail.com',
};

export const RESUME_ASSETS = {
  imageSrc: '/assets/aistudio/WhatsApp_Image_2026-11-12_at_5.43.31_PM_e8bb6074.jpeg',
  pdfSrc: '/assets/aistudio/Siddartha_Reddy_Resume._415cc9f8.pdf',
  downloadFilename: 'Siddartha_Reddy_Resume.pdf',
} as const;
