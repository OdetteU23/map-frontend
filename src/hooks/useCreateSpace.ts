import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { isUser } from '../helpers/types/localTypes';
import { api } from '../helpers/data/fetchData';
import type { Category } from 'map-hybrid-types-server';

export type SpaceFormData = {
  title: string;
  description: string;
  location: string;
  capacity: string;
  price_per_hour: string;
  price_per_day: string;
  category_id: string;
};

const emptyForm: SpaceFormData = {
  title: '',
  description: '',
  location: '',
  capacity: '',
  price_per_hour: '',
  price_per_day: '',
  category_id: '',
};

const useCreateSpace = () => {
  const { user } = useAuth();
  const [form, setForm] = useState<SpaceFormData>(emptyForm);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdSpaceId, setCreatedSpaceId] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api.media.fetchCategories()
      .then((data) => { if (!cancelled) setCategories(data); })
      .catch(() => { /* categories endpoint may not exist yet — silently skip */ });
    return () => { cancelled = true; };
  }, []);

  const updateField = (field: keyof SpaceFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError(null);
  };

  const submitSpace = async () => {
    if (!user || !isUser(user)) return;
    if (!form.title.trim() || !form.location.trim() || !form.price_per_hour) {
      setError('Täytä kaikki pakolliset kentät (otsikko, sijainti, hinta)');
      return;
    }

    setIsSubmitting(true);
    setError(null);
    try {
      const ownerName = user.Firstname || user.username;

      const spaceData = {
        owner_id: user.id,
        owner_name: ownerName,
        owner_username: user.username,
        owner_email: user.email,
        category_id: form.category_id ? Number(form.category_id) : undefined,
        title: form.title.trim(),
        description: form.description.trim(),
        location: form.location.trim(),
        capacity: Number(form.capacity) || 1,
        price_per_hour: Number(form.price_per_hour),
        ...(form.price_per_day ? { price_per_day: Number(form.price_per_day) } : {}),
      };

      const space = await api.upload.uploadSpace(spaceData);

      try {
        localStorage.setItem(
          `space-owner-${space.id}`,
          JSON.stringify({
            ownerId: user.id,
            ownerUsername: user.username,
            ownerName,
            ownerEmail: user.email,
          })
        );
      } catch {
        // ignore storage failures
      }

      setCreatedSpaceId(space.id);
      return space.id;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Tilan luonti epäonnistui');
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setCreatedSpaceId(null);
    setError(null);
  };

  return {
    form,
    categories,
    isSubmitting,
    createdSpaceId,
    error,
    updateField,
    submitSpace,
    resetForm,
  };
};

export default useCreateSpace;
