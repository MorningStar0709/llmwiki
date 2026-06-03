'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { useKBStore, useUserStore } from '@/stores'
import {
  Plus, Loader2, LogOut, Moon, Sun, BookOpen, AlertCircle, RefreshCcw,
} from 'lucide-react'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useTheme } from 'next-themes'
const isLocal = process.env.NEXT_PUBLIC_MODE === 'local'

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return '刚刚'
  if (minutes < 60) return `${minutes}分钟前`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}小时前`
  const days = Math.floor(hours / 24)
  if (days < 30) return `${days}天前`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}个月前`
  return `${Math.floor(months / 12)}年前`
}

export default function WikisPage() {
  const router = useRouter()
  const knowledgeBases = useKBStore((s) => s.knowledgeBases)
  const loading = useKBStore((s) => s.loading)
  const error = useKBStore((s) => s.error)
  const retryFetchKBs = useKBStore((s) => s.fetchKBs)
  const createKB = useKBStore((s) => s.createKB)
  const user = useUserStore((s) => s.user)
  const [creating, setCreating] = React.useState(false)
  const [dialogOpen, setDialogOpen] = React.useState(false)
  const [name, setName] = React.useState('')

  const handleQuickCreate = async () => {
    setCreating(true)
    try {
      const email = user?.email || 'My'
      const displayName = email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
      const kb = await createKB(`${displayName}'s Wiki`)
      router.push(`/wikis/${kb.slug}`)
    } catch (err) {
      console.error('Failed to create KB:', err)
    } finally {
      setCreating(false)
    }
  }

  const handleCreate = async () => {
    if (!name.trim()) return
    setCreating(true)
    try {
      const kb = await createKB(name.trim())
      setDialogOpen(false)
      setName('')
      router.push(`/wikis/${kb.slug}`)
    } catch (err) {
      console.error('Failed to create KB:', err)
    } finally {
      setCreating(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="size-5 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader onNew={() => setDialogOpen(true)} />
        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive">
                <AlertCircle className="size-4" />
              </div>
              <div className="min-w-0">
                <h1 className="text-sm font-semibold text-foreground">无法加载 Wiki</h1>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  {error}
                </p>
              </div>
            </div>
            <button
              onClick={() => retryFetchKBs()}
              className="mt-4 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md bg-primary px-3 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              <RefreshCcw className="size-4" />
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (knowledgeBases.length === 0) {
    return (
      <div className="h-full flex flex-col">
        <PageHeader onNew={() => setDialogOpen(true)} />
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-full max-w-2xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-foreground mb-6">
                <BookOpen size={24} className="text-background" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">
                创建你的第一个 Wiki
              </h1>
              <p className="mt-3 text-base text-muted-foreground leading-relaxed max-w-md mx-auto">
                上传来源、连接 Claude，让它自动编译结构化 Wiki。
              </p>
            </div>

            <div className="grid sm:grid-cols-3 gap-4 mb-10">
              {[
                {
                  step: '1',
                  title: '创建 Wiki',
                  desc: '命名你的知识空间。可以创建任意数量的 Wiki。',
                },
                {
                  step: '2',
                  title: '添加来源',
                  desc: '上传 PDF、笔记、转录稿——任何你想让 Claude 学习的内容。',
                },
                {
                  step: '3',
                  title: '询问 Claude',
                  desc: 'Claude 读取你的来源，编译出带有交叉引用和摘要的 Wiki。',
                },
              ].map((item, i) => (
                <motion.div
                  key={item.step}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.08, ease: [0.25, 0.1, 0.25, 1] }}
                  className="rounded-xl border border-border p-5 bg-card"
                >
                  <div className="flex items-center justify-center w-7 h-7 rounded-full bg-foreground text-background text-xs font-bold mb-3">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold mb-1">{item.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{item.desc}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col items-center gap-3">
              <button
                onClick={handleQuickCreate}
                disabled={creating}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-foreground text-background px-8 py-3 text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer disabled:opacity-50"
              >
                {creating ? (
                  <><Loader2 size={15} className="animate-spin" /> 设置中...</>
                ) : (
                  <><Plus size={15} /> 开始使用</>
                )}
              </button>
              <button
                onClick={() => setDialogOpen(true)}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
              >
                或使用自定义名称创建
              </button>
            </div>
          </div>
        </div>

        <CreateWikiDialog
          open={dialogOpen}
          onOpenChange={setDialogOpen}
          name={name}
          onNameChange={setName}
          creating={creating}
          onCreate={handleCreate}
        />
      </div>
    )
  }

  return (
    <div className="h-full flex flex-col">
      <PageHeader onNew={() => setDialogOpen(true)} />

      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {knowledgeBases.map((kb, index) => {
              const stats: string[] = []
              if (kb.source_count > 0) stats.push(`${kb.source_count} source${kb.source_count !== 1 ? 's' : ''}`)
              if (kb.wiki_page_count > 0) stats.push(`${kb.wiki_page_count} page${kb.wiki_page_count !== 1 ? 's' : ''}`)

              return (
                <motion.div
                  key={kb.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05, ease: [0.25, 0.1, 0.25, 1] }}
                  role="button"
                  tabIndex={0}
                  onClick={() => router.push(`/wikis/${kb.slug}`)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') router.push(`/wikis/${kb.slug}`) }}
                  className="flex flex-col items-start gap-3 p-5 rounded-xl border border-border bg-card hover:bg-accent/50 transition-colors cursor-pointer text-left group overflow-hidden"
                >
                  <div className="flex items-center gap-3 min-w-0 w-full">
                    <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-muted group-hover:bg-accent transition-colors flex-shrink-0">
                      <BookOpen size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h2 className="text-sm font-medium text-foreground truncate">{kb.name}</h2>
                      {kb.description && (
                        <p className="text-xs text-muted-foreground mt-0.5 truncate">{kb.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-muted-foreground/50 w-full">
                    {stats.length > 0 ? (
                      <span>{stats.join(' \u00B7 ')}</span>
                    ) : (
                      <span className="text-muted-foreground/30">暂无来源</span>
                    )}
                    <span className="ml-auto text-muted-foreground/30 shrink-0">
                      {relativeTime(kb.updated_at)}
                    </span>
                  </div>
                </motion.div>
              )
            })}

            <button
              onClick={() => setDialogOpen(true)}
              className="flex flex-col items-center justify-center gap-2 p-5 rounded-xl border border-dashed border-border hover:border-primary/50 hover:bg-accent/30 transition-colors cursor-pointer min-h-[112px]"
            >
              <Plus size={16} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">新建 Wiki</span>
            </button>
          </div>
        </div>
      </div>

      <CreateWikiDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        name={name}
        onNameChange={setName}
        creating={creating}
        onCreate={handleCreate}
      />
    </div>
  )
}

function PageHeader({ onNew }: { onNew?: () => void }) {
  return (
    <div className="shrink-0 flex items-center justify-between px-6 h-12 border-b border-border">
      <span className="text-sm font-medium text-foreground tracking-tight">LLM Wiki</span>
      <div className="flex items-center gap-1">
        {onNew && (
          <button
            onClick={onNew}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-accent rounded-md transition-colors cursor-pointer"
          >
            <Plus className="size-3" />
            新建
          </button>
        )}
        <UserMenu />
      </div>
    </div>
  )
}

function UserMenu() {
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const user = useUserStore((s) => s.user)
  const signOutLocal = useUserStore((s) => s.signOut)
  const [mounted, setMounted] = React.useState(false)
  React.useEffect(() => { setMounted(true) }, [])

  const handleSignOut = async () => {
    if (!isLocal) {
      const { createClient } = await import('@/lib/supabase/client')
      const supabase = createClient()
      await supabase.auth.signOut()
    }
    signOutLocal()
    if (isLocal) return
    router.push('/login')
  }

  if (!user) return null
  const initials = user.email.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="h-6 w-6 bg-muted border border-border rounded-full flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
          <span className="text-[9px] font-medium text-muted-foreground">{initials}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <div className="px-2 py-1.5 text-xs text-muted-foreground truncate">
          {user.email}
        </div>
        <DropdownMenuSeparator />
        {mounted && (
          <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
            {theme === 'dark' ? (
              <><Sun className="mr-2 h-4 w-4" />浅色模式</>
            ) : (
              <><Moon className="mr-2 h-4 w-4" />深色模式</>
            )}
          </DropdownMenuItem>
        )}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          退出登录
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function CreateWikiDialog({
  open,
  onOpenChange,
  name,
  onNameChange,
  creating,
  onCreate,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  name: string
  onNameChange: (name: string) => void
  creating: boolean
  onCreate: () => void
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>新建 Wiki</DialogTitle>
        </DialogHeader>
        <input
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && onCreate()}
          placeholder="我的研究"
          className="w-full rounded-lg border border-input bg-background px-3 py-2 text-sm"
          autoFocus
        />
        <DialogFooter>
          <button
            onClick={onCreate}
            disabled={creating || !name.trim()}
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 disabled:opacity-50 cursor-pointer"
          >
            {creating ? '创建中...' : '创建'}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
