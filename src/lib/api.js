import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from './firebase';

const isMock = !import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.VITE_FIREBASE_API_KEY === 'mock_key';

// Mock data fallback
let mockPosts = [
  {
    id: '1',
    images: ['https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?auto=format&fit=crop&q=80&w=800'],
    caption: 'Cinematic mood. The interplay of shadow and light.',
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '2',
    images: [
      'https://images.unsplash.com/photo-1547826039-bfc35e0f1ea8?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1549887552-cb1071d3e5ca?auto=format&fit=crop&q=80&w=800'
    ],
    caption: 'Abstract explorations in color and texture.',
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: '3',
    images: ['https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&q=80&w=800'],
    caption: 'Minimalist forms.',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const fetchPosts = async () => {
  if (isMock) {
    return new Promise(resolve => setTimeout(() => resolve([...mockPosts]), 800));
  }

  try {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString() || new Date().toISOString()
    }));
  } catch (error) {
    console.error("Error fetching posts:", error);
    return [];
  }
};

export const uploadImages = async (files) => {
  if (isMock) {
    return new Promise(resolve => setTimeout(() => {
      // Create local blob URLs for mock upload
      const urls = files.map(file => URL.createObjectURL(file));
      resolve(urls);
    }, 1500));
  }

  const imgbbKey = import.meta.env.VITE_IMGBB_API_KEY;
  if (!imgbbKey) {
    console.error("Missing ImgBB API Key!");
    throw new Error("Please add VITE_IMGBB_API_KEY to your .env.local file");
  }

  const uploadPromises = files.map(async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    
    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
      method: 'POST',
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.url;
    } else {
      throw new Error(data.error.message);
    }
  });

  return Promise.all(uploadPromises);
};

export const createPost = async (images, caption) => {
  if (isMock) {
    return new Promise(resolve => setTimeout(() => {
      const newPost = {
        id: Date.now().toString(),
        images,
        caption,
        createdAt: new Date().toISOString()
      };
      mockPosts = [newPost, ...mockPosts];
      resolve(newPost);
    }, 500));
  }

  try {
    const docRef = await addDoc(collection(db, 'posts'), {
      images,
      caption,
      createdAt: serverTimestamp()
    });
    return {
      id: docRef.id,
      images,
      caption,
      createdAt: new Date().toISOString()
    };
  } catch (error) {
    console.error("Error creating post:", error);
    throw error;
  }
};

export const loginAdmin = async (email, password) => {
  if (isMock) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (password === 'admin123') {
          resolve({ user: { email: 'admin@janesart.com' } });
        } else {
          reject(new Error('Invalid password'));
        }
      }, 500);
    });
  }

  try {
    return await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const deletePost = async (postId) => {
  if (isMock) {
    return new Promise(resolve => setTimeout(() => {
      mockPosts = mockPosts.filter(p => p.id !== postId);
      resolve();
    }, 500));
  }

  try {
    await deleteDoc(doc(db, 'posts', postId));
  } catch (error) {
    console.error("Error deleting post:", error);
    throw error;
  }
};

let mockSettings = {
  siteName: "Jane's Art",
  footerText: `© ${new Date().getFullYear()} Jane's Art. All rights reserved.`,
  backgroundType: 'video',
  backgroundUrl: 'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260307_083826_e938b29f-a43a-41ec-a153-3d4730578ab8.mp4'
};

export const fetchSettings = async () => {
  if (isMock) {
    return new Promise(resolve => setTimeout(() => resolve(mockSettings), 500));
  }
  
  try {
    const docSnap = await getDoc(doc(db, 'settings', 'main'));
    if (docSnap.exists()) {
      return docSnap.data();
    }
    return null;
  } catch (error) {
    console.error("Error fetching settings:", error);
    return null;
  }
};

export const updateSettings = async (settings) => {
  if (isMock) {
    return new Promise(resolve => setTimeout(() => {
      mockSettings = { ...mockSettings, ...settings };
      resolve(mockSettings);
    }, 500));
  }
  
  try {
    await setDoc(doc(db, 'settings', 'main'), settings, { merge: true });
    return settings;
  } catch (error) {
    console.error("Error updating settings:", error);
    throw error;
  }
};
