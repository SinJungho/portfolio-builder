import { signIn } from '@/auth'
import { Button } from '@/components/ui/button'

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-6 text-center">
        <h1 className="text-2xl font-bold">PortfolioForge</h1>
        <p className="text-muted-foreground">GitHub 계정으로 시작하세요</p>
        <form
          action={async () => {
            'use server'
            await signIn('github', { redirectTo: '/dashboard' })
          }}
        >
          <Button type="submit" size="lg">
            GitHub으로 시작하기
          </Button>
        </form>
      </div>
    </div>
  )
}
