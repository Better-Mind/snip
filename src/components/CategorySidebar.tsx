import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { ChevronLeft, ChevronRight, Home, Book, Briefcase, Lightbulb, Music, Film, Coffee, Palette, Plus, Tag } from "lucide-react"
import { useCurrentCategory } from './CategoryProvider'

const initialCategories = [
  { name: 'Home', icon: Home },
  { name: 'Education', icon: Book },
  { name: 'Work', icon: Briefcase },
  { name: 'Ideas', icon: Lightbulb },
]

export default function CategorySidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const {currentCategory, setCurrentCategory} = useCurrentCategory();
  const [categories, setCategories] = useState(initialCategories)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      setCategories([...categories, { name: newCategoryName, icon: Tag }])
      setNewCategoryName('')
      setIsModalOpen(false)
    }
  }

  return (
    <>
    <div className={cn(
      "flex flex-col border-r bg-secondary/40",
      isCollapsed ? "w-16" : "w-64",
      "transition-all duration-300 ease-in-out"
    )}>
      <div className="flex items-center justify-between p-4">
        {!isCollapsed && (
          <h2 className="text-lg font-semibold">Collections</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <nav className="flex flex-col gap-2 p-2">
          {categories.map((category) => (
            <Button
              key={category.name}
              variant={currentCategory === category.name ? "secondary" : "ghost"}
              className={cn(
                "justify-start",
                isCollapsed ? "w-10 h-10 p-0" : "w-full"
              )}
              onClick={() => setCurrentCategory(category.name)}
            >
              <category.icon className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
              {!isCollapsed && <span>{category.name}</span>}
            </Button>
          ))}
        </nav>
      </ScrollArea>
      <div className="p-4">
          <Button
            variant="outline"
            className={cn("w-full", isCollapsed && "p-0 w-10 h-10")}
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className={cn("h-4 w-4", isCollapsed ? "mx-auto" : "mr-2")} />
            {!isCollapsed && <span>New Collection</span>}
          </Button>
        </div>
    </div>
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Collection</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleAddCategory}>Add Collection</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}