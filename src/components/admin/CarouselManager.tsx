'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Trash2, ArrowUp, ArrowDown, Upload, X } from 'lucide-react'
import Image from 'next/image'

export function CarouselManager({ initialSlides }: { initialSlides: any[] }) {
  const [slides, setSlides] = useState(initialSlides)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    link_url: '',
    image_url: ''
  })
  
  const router = useRouter()
  const supabase = createClient()

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploading(true)
      const file = e.target.files?.[0]
      if (!file) return
      
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('carousel-images')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('carousel-images')
        .getPublicUrl(filePath)

      setNewSlide(prev => ({ ...prev, image_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading image:', error)
      alert('Failed to upload image.')
    } finally {
      setUploading(false)
    }
  }

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSlide.image_url) return alert('Please upload an image')

    setLoading(true)
    const { data, error } = await supabase
      .from('carousel_slides')
      .insert({
        ...newSlide,
        sort_order: slides.length + 1,
        is_active: true
      })
      .select()
      .single()

    if (!error && data) {
      setSlides([...slides, data])
      setNewSlide({ title: '', subtitle: '', link_url: '', image_url: '' })
      router.refresh()
    }
    setLoading(false)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide?')) return

    const { error } = await supabase.from('carousel_slides').delete().eq('id', id)
    if (!error) {
      setSlides(slides.filter(s => s.id !== id))
      router.refresh()
    }
  }

  return (
    <div className="space-y-8">
      {/* Add New Slide */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-bold mb-4">Add New Slide</h2>
        <form onSubmit={handleAdd} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <input
                    value={newSlide.title}
                    onChange={(e) => setNewSlide(prev => ({...prev, title: e.target.value}))}
                    placeholder="Title"
                    className="p-2 border rounded-lg"
                />
                <input
                    value={newSlide.subtitle}
                    onChange={(e) => setNewSlide(prev => ({...prev, subtitle: e.target.value}))}
                    placeholder="Subtitle"
                    className="p-2 border rounded-lg"
                />
            </div>
            
            <div>
                <input
                    value={newSlide.link_url}
                    onChange={(e) => setNewSlide(prev => ({...prev, link_url: e.target.value}))}
                    placeholder="Link URL (Optional)"
                    className="w-full p-2 border rounded-lg"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Slide Image</label>
                <div className="flex items-start gap-4">
                    <div className="flex-1">
                        <div className="relative border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:bg-gray-50 transition-colors">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={uploading}
                            />
                            <div className="flex flex-col items-center pointer-events-none">
                                <Upload className="w-8 h-8 text-gray-400 mb-2" />
                                <span className="text-sm text-gray-500">
                                    {uploading ? 'Uploading...' : 'Click to upload image'}
                                </span>
                            </div>
                        </div>
                        <div className="mt-2">
                             <span className="text-xs text-gray-500 uppercase font-bold mr-2">OR</span>
                             <input 
                                 type="url" 
                                 placeholder="Enter Image URL directly"
                                 value={newSlide.image_url}
                                 onChange={(e) => setNewSlide(prev => ({...prev, image_url: e.target.value}))}
                                 className="w-full p-2 border rounded-lg text-sm mt-1"
                             />
                        </div>
                    </div>
                    {newSlide.image_url && (
                        <div className="relative w-32 h-20 bg-gray-100 rounded-lg overflow-hidden border">
                            <Image src={newSlide.image_url} alt="Preview" fill className="object-cover" />
                            <button
                                type="button"
                                onClick={() => setNewSlide(prev => ({...prev, image_url: ''}))}
                                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    )}
                </div>
            </div>

            <button
                type="submit"
                disabled={loading || uploading || !newSlide.image_url}
                className="w-full bg-black text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50"
            >
                {loading ? 'Adding Slide...' : 'Add Slide'}
            </button>
        </form>
      </div>

      {/* List Slides */}
      <div className="space-y-4">
        {slides.map((slide, index) => (
            <div key={slide.id} className="bg-white p-4 rounded-lg shadow flex gap-4 items-center">
                <div className="w-32 h-20 bg-gray-100 rounded overflow-hidden relative flex-shrink-0">
                    <Image src={slide.image_url} alt="" fill className="object-cover" />
                </div>
                <div className="flex-1">
                    <h3 className="font-bold">{slide.title || 'Untitled Slide'}</h3>
                    <p className="text-sm text-gray-500">{slide.subtitle}</p>
                </div>
                <div className="flex items-center gap-2">
                    <button 
                        onClick={() => handleDelete(slide.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        ))}
        {slides.length === 0 && (
            <p className="text-center text-gray-500 py-8">No slides found.</p>
        )}
      </div>
    </div>
  )
}
