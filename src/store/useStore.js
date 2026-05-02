import { create } from 'zustand';

const useStore = create((set) => ({
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  sortOrder: 'newest',
  setSortOrder: (order) => set({ sortOrder: order }),

  siteSettings: {
    siteName: "Jane's Art",
    footerText: `© ${new Date().getFullYear()} Jane's Art. All rights reserved.`,
    backgroundType: 'video', // 'video' or 'image'
    backgroundUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4'
  },
  setSiteSettings: (settings) => set({ siteSettings: settings }),
  
  isAdminModalOpen: false,
  setAdminModalOpen: (isOpen) => set({ isAdminModalOpen: isOpen }),
  
  isAdmin: false,
  setIsAdmin: (status) => set({ isAdmin: status }),
  
  posts: [],
  setPosts: (posts) => set({ posts }),
  addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
  removePost: (postId) => set((state) => ({ posts: state.posts.filter(p => p.id !== postId) })),
}));

export default useStore;
