import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { setPageTitle } from "../utils/pageTitle";

export default function PublicSubmit() {
  useEffect(() => {
    setPageTitle("Submit Maintenance Request");
  }, []);
  
  const [workTypes, setWorkTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [activeStep, setActiveStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    area: "",
    materials: "",
    manpower: "",
    estimatedTime: "",
    tags: "",
    workType: "",
    submittedByName: "",
    workNature: "",
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  // Fetch work types
  const fetchWorkTypes = () => {
    api
      .get("/public/worktypes")
      .then((res) => {
        setWorkTypes(res.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.response?.data?.message || err.message);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWorkTypes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    setImages(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    setSubmitting(true);
    setError(null);

    const materialsArr = formData.materials
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    const tagsArr = formData.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const fd = new FormData();

    fd.append("title", formData.title);
    fd.append("description", formData.description);
    if (formData.area) fd.append("area", formData.area);
    if (formData.manpower) fd.append("manpower", formData.manpower);
    if (formData.estimatedTime)
      fd.append("estimatedTime", formData.estimatedTime);
    fd.append("workType", formData.workType);
    fd.append("materials", JSON.stringify(materialsArr));
    fd.append("tags", JSON.stringify(tagsArr));
    fd.append("submittedByName", formData.submittedByName);
    fd.append("workNature", formData.workNature);
    images.forEach((file) => fd.append("images", file));

    api
      .post("/public/submit", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })
      .then(() => {
        setSuccess(true);
        setFormData({
          title: "",
          description: "",
          area: "",
          materials: "",
          manpower: "",
          estimatedTime: "",
          tags: "",
          workType: "",
          submittedByName: "",
          workNature: "",
        });
        setImages([]);
        setImagePreviews([]);
        setActiveStep(1);
      })
      .catch((err) => setError(err.response?.data?.message || err.message))
      .finally(() => setSubmitting(false));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        if (!formData.title || !formData.description || !formData.submittedByName || !formData.workNature) {
          setError("Please fill all required fields before continuing");
          return false;
        }
        return true;
      case 2:
        if (!formData.workType) {
          setError("Please select a work type before continuing");
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const nextStep = () => {
    if (!validateStep(activeStep)) return;
    setError(null);
    setActiveStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setError(null);
    setActiveStep(prev => Math.max(prev - 1, 1));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-600 border-t-transparent mx-auto mb-6"></div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Getting Things Ready</h3>
          <p className="text-gray-600">Loading work types...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50 backdrop-blur-sm">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-3">Oops! Something went wrong</h3>
          <p className="text-red-600 mb-6 bg-red-50 p-4 rounded-2xl">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full text-center border border-white/50 backdrop-blur-sm">
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <svg className="w-12 h-12 text-green-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Request Submitted!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed bg-green-50 p-4 rounded-2xl">
            Your maintenance request has been submitted successfully. Our team will review it and get back to you soon.
          </p>
          <div className="space-y-3">
            <button
              onClick={() => setSuccess(false)}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-4 rounded-2xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
            >
              Submit Another Request
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 pb-8">
      {/* Floating Header */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-800">Maintenance Request</h1>
                <p className="text-gray-600 text-sm">PYDAH Maintenance Portal</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="max-w-xl mx-auto px-6 pt-6 pb-4 relative z-0">
        <div className="flex items-center justify-between relative">
          {/* Background line */}
          <div className="absolute left-0 right-0 h-1 bg-gray-200 -z-10"></div>
          {/* Progress line */}
          <div
            className="absolute left-0 right-0 h-1 bg-blue-600 -z-10 transition-all duration-500"
            style={{ width: `${((activeStep - 1) / 2) * 100}%` }}
          ></div>
          {[1, 2, 3].map((step, index) => (
            <React.Fragment key={step}>
              <div className="flex flex-col items-center relative z-10">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-semibold text-xs transition-all duration-300 ${
                  step <= activeStep
                    ? 'bg-blue-600 text-white shadow-lg scale-140'
                    : 'bg-gray-200 text-gray-500 scale-140'
                }`}>
                  {step}
                </div>
              </div>
              {/* Progress line between steps */}
              {index < 2 && (
                <div className={`flex-1 h-0.5 mx-2 transition-all duration-500 ${
                  step < activeStep ? 'bg-blue-600' : 'bg-gray-200'
                }`}></div>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Main Form */}
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-3xl shadow-2xl border border-white/50 overflow-hidden backdrop-blur-sm">
          {/* Only wrap step 3 content in form for submission */}
          {activeStep === 3 ? (
            <form onSubmit={handleSubmit} className="p-6">
              {/* Step 3: Images & Review */}
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-800">Add Photos & Review</h2>
                  {/* <p className="text-gray-600 text-s">Visuals help us understand better</p> */}
                </div>

                <div className="space-y-4">
                  {/* Image Upload */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Attach Photos (Optional)
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-2xl p-6 text-center hover:border-blue-400 transition-all duration-300 bg-gray-50 hover:bg-blue-50">
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleFilesChange}
                        className="hidden"
                        id="image-upload"
                      />
                      <label htmlFor="image-upload" className="cursor-pointer block">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <p className="text-gray-700 font-medium">Tap to upload photos</p>
                        <p className="text-sm text-gray-500 mt-1">Supports JPG, PNG, GIF</p>
                      </label>
                    </div>

                    {imagePreviews.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm font-medium text-gray-700 mb-3">
                          Selected Photos ({imagePreviews.length})
                        </p>
                        <div className="grid grid-cols-3 gap-2">
                          {imagePreviews.map((src, idx) => (
                            <div key={idx} className="relative group">
                              <img
                                src={src}
                                alt="preview"
                                className="h-20 w-full object-cover rounded-xl border border-gray-200"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  const newPreviews = imagePreviews.filter((_, i) => i !== idx);
                                  const newImages = images.filter((_, i) => i !== idx);
                                  setImagePreviews(newPreviews);
                                  setImages(newImages);
                                }}
                                className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-xs opacity-90 hover:opacity-100 transition-all duration-200 shadow-lg"
                              >
                                ×
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Review Summary */}
                  <div className="bg-blue-50 rounded-2xl p-4">
                    <h3 className="font-semibold text-gray-800 mb-3">Request Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">{formData.title || "Not provided"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work Type:</span>
                        <span className="font-medium">{workTypes.find(wt => wt._id === formData.workType)?.name || "Not selected"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Location:</span>
                        <span className="font-medium">{formData.area || "Not specified"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Work Nature:</span>
                        <span className="font-medium">{formData.workNature || "Not specified"}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4 animate-shake">
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <span className="text-red-800 font-medium">Error</span>
                    </div>
                    <p className="text-red-700 mt-1 text-sm">{error}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex justify-between pt-6 mt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-medium transition-all duration-200 active:scale-95"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-2 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white rounded-xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                        <span>Submitting...</span>
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Submit</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          ) : (
            /* Steps 1 & 2 - No form wrapper */
            <div className="p-6">
              {/* Step 1: Basic Details */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* <div className="text-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">What needs maintenance?</h2>
                    <p className="text-gray-600 mt-2">Tell us about the issue</p>
                  </div> */}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Request Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                        className="w-full h-3 px-4 py-4 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 text-m"
                        placeholder="Brief description of the issue"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Detailed Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                        rows="4"
                        className="w-full h-90 px-4 py-4 border-0 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200 resize-none text-m"
                        placeholder="Describe the issue in detail..."
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Your Name *
                        </label>
                        <input
                          type="text"
                          name="submittedByName"
                          value={formData.submittedByName}
                          onChange={handleChange}
                          required
                          className="w-full h-4 px-4 py-4 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                          placeholder="Enter your full name"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Work Nature *
                        </label>
                        <select
                          name="workNature"
                          value={formData.workNature}
                          onChange={handleChange}
                          required
                          className="w-full px-4 py-4 border-0 bg-gray-50 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                        >
                          <option value="">Select work type</option>
                          <option value="Repair Work">Repair Work</option>
                          <option value="New Work">New Work</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Location & Resources */}
              {activeStep === 2 && (
                <div className="space-y-6 animate-fadeIn">
                  <div className="text-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">Location & Resources</h2>
                    {/* <p className="text-gray-600 mt-2">Where and what's needed</p> */}
                  </div>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Area/Location
                        </label>
                        <input
                          type="text"
                          name="area"
                          value={formData.area}
                          onChange={handleChange}
                          className="w-full h-9 px-4 py-4 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                          placeholder="Building, room, or area"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Work Type *
                        </label>
                        <select
                          name="workType"
                          value={formData.workType}
                          onChange={handleChange}
                          required
                          className="w-full h-10 px-4 py-0 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                        >
                          <option value="">Select work category</option>
                          {workTypes.map((wt) => (
                            <option key={wt._id} value={wt._id}>{wt.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Materials Needed
                        </label>
                        <input
                          type="text"
                          name="materials"
                          value={formData.materials}
                          onChange={handleChange}
                          placeholder="e.g., cement, bricks, pipes"
                          className="w-full h-10 px-4 py-4 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Manpower Details
                        </label>
                        <input
                          type="text"
                          name="manpower"
                          value={formData.manpower}
                          onChange={handleChange}
                          placeholder="e.g., 2 electricians, 1 plumber"
                          className="w-full h-10 px-4 py-4 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Estimated Time
                      </label>
                      <input
                        type="text"
                        name="estimatedTime"
                        value={formData.estimatedTime}
                        onChange={handleChange}
                        placeholder="e.g., 2 hours, 1 day, 3 days"
                        className="w-full h-10 px-4 py-4 border-0 bg-gray-50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all duration-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Error Message for Steps 1 & 2 */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-4 animate-shake">
                  <div className="flex items-center space-x-2">
                    <svg className="w-5 h-5 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <span className="text-red-800 font-medium">Error</span>
                  </div>
                  <p className="text-red-700 mt-1 text-sm">{error}</p>
                </div>
              )}

              {/* Navigation Buttons for Steps 1 & 2 */}
              <div className={`flex ${activeStep > 1 ? 'justify-between' : 'justify-end'} pt-6 mt-6 border-t border-gray-200`}>

                {activeStep > 1 ? (
                  <button
                    type="button"
                    onClick={prevStep}
                    className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-medium transition-all duration-200 active:scale-95"
                  >
                    Back
                  </button>
                ) : null}

                <button
                  type="button"
                  onClick={nextStep}
                  className="px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-medium transition-all duration-200 shadow-lg hover:shadow-xl active:scale-95"
                >
                  Continue
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
