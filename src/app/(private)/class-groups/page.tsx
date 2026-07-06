"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, Plus, Users, ChevronRight, Edit2, Trash2 } from "lucide-react";
import { ClassGroup } from "@/types/ClassGroup";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useClassGroups } from "@/hooks/useClassGroups";
import { NewClassGroupModal } from "@/components/new-class-group-modal";

export default function ClassGroupsPage() {
  const {
    classGroups,
    availableStudents,
    isLoading,
    isSaving,
    search,
    setSearch,
    saveClassGroup,
    deleteClassGroup
  } = useClassGroups();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGroup, setEditingGroup] = useState<ClassGroup | null>(null);

  const openModal = (group?: ClassGroup) => {
    setEditingGroup(group || null);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Turmas</h1>
          <p className="text-muted-foreground mt-1">Gerencie seus grupos de alunos</p>
        </div>
        <Button onClick={() => openModal()} className="shrink-0 gap-2">
          <Plus className="size-4" /> Nova Turma
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-5 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome da turma..."
          className="pl-10 py-6 bg-muted/50 border-transparent focus-visible:bg-background text-base rounded-xl"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="flex flex-col gap-3">
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Carregando turmas...</div>
        ) : classGroups.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">Nenhuma turma encontrada.</div>
        ) : (
          classGroups.map((group) => (
            <Link key={group.id} href={`/class-groups/${group.id}`} className="block">
              <div className="group flex items-center justify-between p-4 bg-card border rounded-xl shadow-sm hover:shadow-md hover:border-primary/30 transition-all cursor-pointer">
                <div className="flex items-center gap-4">
                  <div className="size-12 rounded-full bg-primary/10 flex items-center justify-center text-lg font-bold text-primary shrink-0">
                    <Users className="size-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-semibold text-base">{group.name}</span>
                    <span className="text-sm text-muted-foreground">
                                            {group.students?.length || 0} alunos vinculados
                                        </span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); openModal(group); }}
                    >
                      <Edit2 className="size-4 text-muted-foreground hover:text-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-8"
                      onClick={(e) => { e.preventDefault(); e.stopPropagation(); deleteClassGroup(group.id); }}
                    >
                      <Trash2 className="size-4 text-destructive hover:text-destructive/80" />
                    </Button>
                  </div>
                  <ChevronRight className="size-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>

      <NewClassGroupModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={saveClassGroup}
        initialData={editingGroup}
        availableStudents={availableStudents}
        isSaving={isSaving}
      />
    </div>
  );
}