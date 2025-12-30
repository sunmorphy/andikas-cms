export interface User {
    id: string;
    email: string;
    username: string;
    name: string;
}

export interface LoginCredentials {
    identifier: string;
    password: string;
}

export interface RegisterData {
    email: string;
    username: string;
    password: string;
    name: string;
}

export interface Skill {
    id: string;
    userId: string;
    name: string;
    icon: string;
    createdAt: string;
    updatedAt: string;
}

export interface Experience {
    id: string;
    userId: string;
    startYear: number;
    endYear: number | null;
    companyName: string;
    description: string | null;
    location: string;
    createdAt: string;
    updatedAt: string;
    experienceSkills?: {
        skill: Skill;
    }[];
}

export interface Education {
    id: string;
    userId: string;
    year: string;
    institutionName: string;
    description: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface Certification {
    id: string;
    userId: string;
    name: string;
    issuingOrganization: string;
    year: number;
    description: string | null;
    certificateLink: string | null;
    createdAt: string;
    updatedAt: string;
    certificationSkills?: {
        skill: Skill;
    }[];
}

export interface Project {
    id: string;
    userId: string;
    title: string;
    slug: string;
    description: string;
    content: string;
    coverImage: string | null;
    contentImages: string[];
    publishedAt: string | null;
    highlighted?: boolean;
    createdAt: string;
    updatedAt: string;
    projectSkills?: {
        skill: Skill;
    }[];
}

export interface UserDetails {
    id: string;
    userId: string;
    name: string;
    role: string;
    description: string | null;
    socialMedias: string[] | null;
    profilePhoto: string | null;
    createdAt: string;
    updatedAt: string;
}

export interface ApiResponse<T> {
    success: boolean;
    data?: T;
    error?: string;
}
