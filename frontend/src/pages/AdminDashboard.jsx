import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminApi, marketsApi } from '../utils/api';
import { uploadImage, updateMarketImageUrl } from '../utils/supabase';

function AdminDashboard({ user, onUpdate }) {
  const navigate = useNavigate();
  const [markets, setMarkets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingMarket, setCreatingMarket] = useState(false);
  const [resolvingMarket, setResolvingMarket] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(null);

  // Form state
  const [marketTitle, setMarketTitle] = useState('');
  const [marketDescription, setMarketDescription] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  // Per-market image upload state
  const [marketImagePreviews, setMarketImagePreviews] = useState({});
  const [marketSelectedImages, setMarketSelectedImages] = useState({});

  useEffect(() => {
    if (user?.role !== 'admin') {
      navigate('/');
      return;
    }
    loadMarkets();
  }, [user]);

  const loadMarkets = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await marketsApi.getAll();
      setMarkets(response.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateMarket = async (e) => {
    e.preventDefault();
    if (!marketTitle.trim()) {
      alert('Please enter a title');
      return;
    }

    setCreatingMarket(true);
    try {
      // Create market first
      const response = await adminApi.createMarket(marketTitle, marketDescription || null);
      const marketId = response.data?.id;

      // Upload image if selected
      if (selectedImage && marketId) {
        try {
          const { publicUrl } = await uploadImage(selectedImage, selectedImage.name);
          await updateMarketImageUrl(marketId, publicUrl);
        } catch (imgError) {
          console.error('Failed to upload image:', imgError);
          alert('Market created but image upload failed. You can upload it later.');
        }
      }

      setMarketTitle('');
      setMarketDescription('');
      setSelectedImage(null);
      setImagePreview(null);
      await loadMarkets();
      alert('Market created successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setCreatingMarket(false);
    }
  };

  const handleMarketImageSelect = (marketId, file) => {
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setMarketSelectedImages(prev => ({ ...prev, [marketId]: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setMarketImagePreviews(prev => ({ ...prev, [marketId]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadImage = async (marketId) => {
    const imageFile = marketSelectedImages[marketId];
    if (!imageFile) {
      alert('Please select an image first');
      return;
    }

    setUploadingImage(marketId);
    try {
      const { publicUrl } = await uploadImage(imageFile, imageFile.name);
      await updateMarketImageUrl(marketId, publicUrl);
      setMarketSelectedImages(prev => {
        const newState = { ...prev };
        delete newState[marketId];
        return newState;
      });
      setMarketImagePreviews(prev => {
        const newState = { ...prev };
        delete newState[marketId];
        return newState;
      });
      await loadMarkets();
      alert('Image uploaded successfully!');
    } catch (err) {
      alert(`Error uploading image: ${err.message}`);
    } finally {
      setUploadingImage(null);
    }
  };

  const handleResolveMarket = async (marketId, resolution) => {
    if (!confirm(`Are you sure you want to resolve this market as ${resolution}?`)) {
      return;
    }

    setResolvingMarket(marketId);
    try {
      await adminApi.resolveMarket(marketId, resolution);
      await loadMarkets();
      if (onUpdate) onUpdate();
      alert('Market resolved successfully!');
    } catch (err) {
      alert(`Error: ${err.message}`);
    } finally {
      setResolvingMarket(null);
    }
  };

  if (user?.role !== 'admin') {
    return <div className="error">Access denied. Admin only.</div>;
  }

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  const openMarkets = markets.filter((m) => m.status === 'open');

  return (
    <div>
      <button onClick={() => navigate('/')} className="back-btn">← Back to Markets</button>
      <h1 className="page-title">Admin Dashboard</h1>

      <div className="admin-section">
        <h2 className="admin-section-title">Create New Market</h2>
        <form onSubmit={handleCreateMarket} className="create-market-form">
          <div className="form-group">
            <label>Title (required)</label>
            <input
              type="text"
              value={marketTitle}
              onChange={(e) => setMarketTitle(e.target.value)}
              required
              className="form-input"
              placeholder="Enter market title"
            />
          </div>
          <div className="form-group">
            <label>Description (optional)</label>
            <textarea
              value={marketDescription}
              onChange={(e) => setMarketDescription(e.target.value)}
              className="form-input form-textarea"
              placeholder="Enter market description"
            />
          </div>
          <div className="form-group">
            <label>Market Image (optional)</label>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageSelect}
              className="form-input"
            />
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="w-32 h-32 object-cover rounded-lg border border-gray-300"
                />
                <button
                  type="button"
                  onClick={() => {
                    setSelectedImage(null);
                    setImagePreview(null);
                  }}
                  className="mt-2 text-sm text-red-600 hover:text-red-800"
                >
                  Remove Image
                </button>
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">
              Upload image to Supabase Storage (max 5MB). Image will be saved to 'card-images' bucket.
            </p>
          </div>
          <button type="submit" disabled={creatingMarket} className="create-btn">
            {creatingMarket ? 'Creating...' : 'Create Market'}
          </button>
        </form>
      </div>

      <div className="admin-section">
        <h2 className="admin-section-title">Open Markets ({openMarkets.length})</h2>
        {openMarkets.length === 0 ? (
          <div className="empty-state">No open markets</div>
        ) : (
          <div className="markets-grid">
            {openMarkets.map((market) => (
              <div key={market.id} className="admin-market-card">
                <div className="flex items-start gap-4 mb-4">
                  {market.image_url ? (
                    <img
                      src={market.image_url}
                      alt={market.title}
                      className="w-20 h-20 rounded-lg object-cover"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/80x80?text=No+Image';
                      }}
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-lg bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-400 text-xs">No Image</span>
                    </div>
                  )}
                  <div className="flex-1">
                    <h3 className="admin-market-title">{market.title}</h3>
                    {market.description && (
                      <p className="admin-market-description">{market.description}</p>
                    )}
                  </div>
                </div>
                <div className="admin-market-meta">
                  Created: {new Date(market.created_at).toLocaleString()}
                </div>
                <div className="mb-3">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Upload/Update Image
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        handleMarketImageSelect(market.id, file);
                      }
                    }}
                    className="form-input text-sm"
                  />
                  {marketImagePreviews[market.id] && (
                    <div className="mt-2">
                      <img
                        src={marketImagePreviews[market.id]}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded border border-gray-300"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setMarketSelectedImages(prev => {
                            const newState = { ...prev };
                            delete newState[market.id];
                            return newState;
                          });
                          setMarketImagePreviews(prev => {
                            const newState = { ...prev };
                            delete newState[market.id];
                            return newState;
                          });
                        }}
                        className="mt-1 text-xs text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                  <button
                    onClick={() => handleUploadImage(market.id)}
                    disabled={!marketSelectedImages[market.id] || uploadingImage === market.id}
                    className="mt-2 px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                  >
                    {uploadingImage === market.id ? 'Uploading...' : 'Upload Image'}
                  </button>
                </div>
                <div className="admin-market-actions">
                  <button
                    onClick={() => handleResolveMarket(market.id, 'YES')}
                    disabled={resolvingMarket === market.id}
                    className="resolve-btn yes"
                  >
                    {resolvingMarket === market.id ? 'Resolving...' : 'Resolve as YES'}
                  </button>
                  <button
                    onClick={() => handleResolveMarket(market.id, 'NO')}
                    disabled={resolvingMarket === market.id}
                    className="resolve-btn no"
                  >
                    {resolvingMarket === market.id ? 'Resolving...' : 'Resolve as NO'}
                  </button>
                  <button
                    onClick={() => navigate(`/markets/${market.id}`)}
                    className="view-btn"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
