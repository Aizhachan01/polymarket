import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://lbndjqzeewbrwxkizkwj.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxibmRqcXplZXdicnd4a2l6a3dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc1NTQyMjMsImV4cCI6MjA4MzEzMDIyM30.cP-B-cBnk6Va54nmqDZzP3eddEFCixS_T_sZMa3-AHE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Storage bucket name
export const STORAGE_BUCKET = 'card-images';

// Upload image to Supabase Storage
export const uploadImage = async (file, fileName) => {
  try {
    const fileExt = fileName.split('.').pop();
    const filePath = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    
    const { data, error } = await supabase.storage
      .from(STORAGE_BUCKET)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(filePath);

    return { filePath, publicUrl };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

// Update market image URL in database
export const updateMarketImageUrl = async (marketId, imageUrl) => {
  try {
    const { data, error } = await supabase
      .from('markets')
      .update({ image_url: imageUrl })
      .eq('id', marketId)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating market image URL:', error);
    throw error;
  }
};
