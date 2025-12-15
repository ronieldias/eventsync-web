'use client';

import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface EventSearchProps {
  search: string;
  category: string;
  onSearchChange: (value: string) => void;
  onCategoryChange: (value: string) => void;
}

export function EventSearch({ 
  search, 
  category, 
  onSearchChange, 
  onCategoryChange 
}: EventSearchProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-8 bg-card p-4 rounded-lg shadow-sm border">
      <div className="flex-1">
        <Input 
          placeholder="Buscar eventos por nome..." 
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>
      <div className="w-full sm:w-[200px]">
        <Select value={category} onValueChange={onCategoryChange}>
          <SelectTrigger>
            <SelectValue placeholder="Categoria" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas</SelectItem>
            <SelectItem value="show">Show</SelectItem>
            <SelectItem value="palestra">Palestra</SelectItem>
            <SelectItem value="workshop">Workshop</SelectItem>
            <SelectItem value="esporte">Esporte</SelectItem>
            <SelectItem value="gastronomia">Gastronomia</SelectItem>
            <SelectItem value="outro">Outro</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}