
export type CreateProjectType = {
    projectName: string;
    projectLanguage: string;
    projectCode: string;
    userId: string;
};

export type UpdateProjectType = Partial<Omit<CreateProjectType, 'userId'>>;