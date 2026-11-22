import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import api from "@/lib/axios";
import type { RoadmapType } from "@/types";

type ProjectDifficulty = "Beginner" | "Intermediate" | "Advanced";

export interface ProjectChapter {
  chapterId: string;
  chapterName: string;
  content: string;
  isOptional?: boolean;
}

export interface ProjectSection {
  sectionId: string;
  sectionName: string;
  chapters: ProjectChapter[];
}

export interface ProjectSummary {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  coverImageURL?: string;
  roadmap?: RoadmapType;
  difficultyLevel?: ProjectDifficulty;
  isActive?: boolean;
  requiredSkills?: string[];
  sections?: ProjectSection[];
}

export interface ProjectFormData {
  name: string;
  slug: string;
  description: string;
  coverImageURL: string;
  roadmap: RoadmapType;
  difficultyLevel: ProjectDifficulty;
}

export type ProjectMetadataUpdate = Partial<
  Pick<
    ProjectSummary,
    "name" | "description" | "coverImageURL" | "roadmap" | "difficultyLevel"
  >
>;

const invalidateProjectCatalog = (queryClient: {
  invalidateQueries: (options: { queryKey: string[] }) => Promise<unknown>;
}) => queryClient.invalidateQueries({ queryKey: ["projects"] });

export const useCreateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: ProjectFormData) => {
      const response = await api.post("/projects", {
        ...payload,
        requiredSkills: [],
      });
      return response.data?.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useUpdateProject = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      updatedData,
    }: {
      projectId: string;
      updatedData: ProjectMetadataUpdate;
    }) => {
      const response = await api.patch(`/projects/${projectId}`, {
        updatedData,
      });
      return response.data?.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useAddProjectSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      sectionName,
    }: {
      projectId: string;
      sectionName: string;
    }) => {
      const response = await api.post(`/projects/${projectId}/sections`, {
        sectionName,
        chapters: [],
      });
      return response.data?.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useUpdateProjectSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      sectionId,
      updatedSectionName,
    }: {
      projectId: string;
      sectionId: string;
      updatedSectionName: string;
    }) => {
      const response = await api.patch(`/projects/${projectId}/sections`, {
        sectionId,
        updatedSectionName,
      });
      return response.data?.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useDeleteProjectSection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      sectionId,
    }: {
      projectId: string;
      sectionId: string;
    }) => {
      const response = await api.delete(`/projects/${projectId}/sections`, {
        data: { sectionId },
      });
      return response.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useAddProjectChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      sectionId,
      chapterName,
      content,
      isOptional,
    }: {
      projectId: string;
      sectionId: string;
      chapterName: string;
      content: string;
      isOptional: boolean;
    }) => {
      const response = await api.post(
        `/projects/${projectId}/sections/${sectionId}/chapters`,
        { chapterName, content, isOptional, isCompleted: false },
      );
      return response.data?.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useUpdateProjectChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      sectionId,
      chapterId,
      chapterName,
      content,
      isOptional,
    }: {
      projectId: string;
      sectionId: string;
      chapterId: string;
      chapterName: string;
      content: string;
      isOptional: boolean;
    }) => {
      const response = await api.patch(
        `/projects/${projectId}/sections/${sectionId}/chapters/${chapterId}`,
        {
          updatedChapterName: chapterName,
          updatedChapterContent: content,
          updatedIsOptional: isOptional,
        },
      );
      return response.data?.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export const useDeleteProjectChapter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      projectId,
      sectionId,
      chapterId,
    }: {
      projectId: string;
      sectionId: string;
      chapterId: string;
    }) => {
      const response = await api.delete(
        `/projects/${projectId}/sections/${sectionId}/chapters/${chapterId}`,
      );
      return response.data;
    },
    onSuccess: () => invalidateProjectCatalog(queryClient),
  });
};

export interface UserProjectProgress {
  _id: string;
  user?: {
    userName?: string;
    userEmail?: string;
    userContactNo?: string;
  };
  project?: {
    name?: string;
    slug?: string;
  };
  isCompleted?: boolean;
  lastUpdated?: string;
}

interface UserProjectsResponse {
  data: UserProjectProgress[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export const useProjects = () =>
  useQuery<ProjectSummary[]>({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await api.get("/projects");
      return response.data?.data || [];
    },
    staleTime: 5 * 60 * 1000,
  });

export const useUserProjects = (page = 1, limit = 10, search = "") => {
  const query = useQuery<UserProjectsResponse>({
    queryKey: ["user-projects", page, limit, search],
    queryFn: async () => {
      const response = await api.get("/admin/dashboard", {
        params: {
          type: "user-projects",
          page,
          limit,
          search,
        },
      });

      const responseData = response.data?.data || {};
      return {
        data: responseData.items || [],
        pagination: {
          total: responseData.total || 0,
          page,
          limit,
          totalPages: responseData.totalPages || 0,
        },
      };
    },
  });

  return {
    ...query,
    data: query.data?.data || [],
    pagination: query.data?.pagination || {
      total: 0,
      page,
      limit,
      totalPages: 0,
    },
    isLoading: query.isLoading,
  };
};
