export interface Album {
    id: number;
    title: string;
    description?: string;
    createdAt: string;
  }
  
  export interface Photo {
    id: number;
    albumId: number;
    title: string;
    url: string;
    createdAt: string;
  }
  
  export interface UnsplashPhoto {
    id: string;
    alt_description: string;
    urls: {
      regular: string;
      thumb: string;
    };
  }
  
  export type ViewType = 'table' | 'folder';