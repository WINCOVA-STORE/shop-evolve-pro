import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  Github, 
  Download, 
  RefreshCw, 
  CheckCircle2, 
  AlertCircle, 
  FileCode,
  Database,
  Rocket,
  Shield,
  Info,
  ExternalLink,
  Copy,
  Clock,
  ImageIcon,
  HelpCircle,
  AlertTriangle,
  ArrowLeft,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import githubHomeImg from "@/assets/recovery-github-home.png";
import githubCodeImg from "@/assets/recovery-github-code.png";
import lovableGithubImg from "@/assets/recovery-lovable-github.png";
import vercelDeployImg from "@/assets/recovery-vercel-deploy.png";

const DisasterRecoveryGuide = () => {
  const { toast } = useToast();
  const { t } = useTranslation();
  const [imageDialog, setImageDialog] = useState<{ open: boolean; src: string; title: string }>({
    open: false,
    src: "",
    title: ""
  });

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('recovery.copied'),
      description: `${label} ${t('recovery.copied_to_clipboard')}`,
    });
  };

  const openImage = (src: string, title: string) => {
    setImageDialog({ open: true, src, title });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => window.history.back()}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          {t('recovery.back_button')}
        </Button>

        {/* Hero Section */}
        <div className="mb-8 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold mb-3">
            {t('recovery.title')}
          </h1>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('recovery.subtitle')}
          </p>
          <Alert className="max-w-2xl mx-auto mt-4">
            <Clock className="h-4 w-4" />
            <AlertDescription>
              {t('recovery.maintenance_notice')}
            </AlertDescription>
          </Alert>
        </div>

        {/* Recovery Order Section */}
        <Card className="mb-8 border-2 border-primary/30 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <AlertCircle className="w-6 h-6 text-primary" />
              {t('recovery.recovery_order_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="bg-background">
              <AlertDescription className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    1
                  </div>
                  <div>
                    <p className="font-semibold">{t('recovery.recovery_order_step1')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('recovery.scenario_1_desc')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    2
                  </div>
                  <div>
                    <p className="font-semibold">{t('recovery.recovery_order_step2')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('recovery.step_4_title')}
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center font-bold">
                    3
                  </div>
                  <div>
                    <p className="font-semibold">{t('recovery.recovery_order_step3')}</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {t('recovery.scenario_3_desc')}
                    </p>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>

        {/* GitHub Connection Status */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Github className="h-5 w-5" />
              {t('recovery.github_status')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Info className="h-4 w-4" />
              <AlertTitle>{t('recovery.how_verify')}</AlertTitle>
              <AlertDescription className="mt-2 space-y-2">
                <p>1. {t('recovery.verify_step_1')}</p>
                <p>2. {t('recovery.verify_step_2')}</p>
                <p>3. {t('recovery.verify_step_3')}</p>
                <p>4. {t('recovery.verify_step_4')}</p>
              </AlertDescription>
            </Alert>

            <Button 
              variant="outline" 
              size="sm"
              onClick={() => openImage(lovableGithubImg, "Lovable GitHub Connection")}
              className="mr-2"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              {t('recovery.view_image')}
            </Button>

            <div className="flex items-center gap-2 text-sm mt-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://github.com', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('recovery.open_github')}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.open('https://lovable.dev', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t('recovery.open_lovable')}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Scenario 1: Normal Recovery */}
        <Card className="mb-8">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <FileCode className="h-6 w-6 text-primary" />
                  {t('recovery.scenario_1_title')}
                </CardTitle>
                <CardDescription className="mt-2">
                  {t('recovery.scenario_1_desc')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-green-500/10 text-green-700 border-green-500/20">
                {t('recovery.most_common')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.step_1_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.step_1_desc')} <strong>github.com</strong>
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openImage(githubHomeImg, "GitHub Homepage")}
                  className="mr-2"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t('recovery.view_image')}
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.open('https://github.com', '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {t('recovery.go_to_github')}
                </Button>
              </div>
            </div>

            <Separator />

            {/* Step 2 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.step_2_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.step_2_desc')}
                </p>
                <Alert className="bg-amber-500/10 border-amber-500/20">
                  <AlertCircle className="h-4 w-4 text-amber-600" />
                  <AlertTitle className="text-amber-600">{t('recovery.personal_repo_title')}</AlertTitle>
                  <AlertDescription className="text-amber-600/80">
                    {t('recovery.personal_repo_desc')}
                  </AlertDescription>
                </Alert>
                <Alert className="bg-blue-500/10 border-blue-500/20 mt-3">
                  <Info className="h-4 w-4 text-blue-600" />
                  <AlertTitle className="text-blue-600">{t('recovery.org_repo_title')}</AlertTitle>
                  <AlertDescription className="text-blue-600/80">
                    1. {t('recovery.org_repo_desc_1')}<br/>
                    2. {t('recovery.org_repo_desc_2')}<br/>
                    3. {t('recovery.org_repo_desc_3')}<br/>
                    4. {t('recovery.org_repo_desc_4')}
                  </AlertDescription>
                </Alert>
              </div>
            </div>

            <Separator />

            {/* Step 3 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.step_3_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.step_3_desc')} <strong>{"<> Code"}</strong>
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => openImage(githubCodeImg, "GitHub Code Button")}
                  className="mb-3"
                >
                  <ImageIcon className="h-4 w-4 mr-2" />
                  {t('recovery.view_image')}
                </Button>
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <p className="font-medium">{t('recovery.options_title')}</p>
                  <div className="space-y-2">
                    <div className="flex items-start gap-3">
                      <Download className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{t('recovery.option_a_title')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('recovery.option_a_desc')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Copy className="h-5 w-5 text-primary mt-0.5" />
                      <div>
                        <p className="font-medium">{t('recovery.option_b_title')}</p>
                        <p className="text-sm text-muted-foreground">
                          {t('recovery.option_b_desc')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />

            {/* Step 4 */}
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.step_4_title')}</h3>
                <p className="text-muted-foreground mb-4">
                  {t('recovery.step_4_desc')}
                </p>
                <div className="grid gap-3">
                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      {t('recovery.deploy_option_1_title')}
                    </h4>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => openImage(vercelDeployImg, "Vercel Deploy")}
                      className="mb-2"
                    >
                      <ImageIcon className="h-4 w-4 mr-2" />
                      {t('recovery.view_image')}
                    </Button>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>{t('recovery.deploy_option_1_step_1')}</li>
                      <li>{t('recovery.deploy_option_1_step_2')}</li>
                      <li>{t('recovery.deploy_option_1_step_3')}</li>
                      <li>{t('recovery.deploy_option_1_step_4')}</li>
                      <li>{t('recovery.deploy_option_1_step_5')}</li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <Rocket className="h-4 w-4 text-primary" />
                      {t('recovery.deploy_option_2_title')}
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>{t('recovery.deploy_option_2_step_1')}</li>
                      <li>{t('recovery.deploy_option_2_step_2')}</li>
                      <li>{t('recovery.deploy_option_2_step_3')}</li>
                      <li>{t('recovery.deploy_option_2_step_4')}</li>
                      <li>{t('recovery.deploy_option_2_step_5')}</li>
                    </ol>
                  </div>

                  <div className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-2 flex items-center gap-2">
                      <RefreshCw className="h-4 w-4 text-primary" />
                      {t('recovery.deploy_option_3_title')}
                    </h4>
                    <ol className="text-sm text-muted-foreground space-y-1 ml-6 list-decimal">
                      <li>{t('recovery.deploy_option_3_step_1')}</li>
                      <li>{t('recovery.deploy_option_3_step_2')}</li>
                      <li>{t('recovery.deploy_option_3_step_3')}</li>
                      <li>{t('recovery.deploy_option_3_step_4')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario 2: Organization Problem */}
        <Card className="mb-8 border-amber-500/20">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <AlertCircle className="h-6 w-6 text-amber-600" />
                  {t('recovery.scenario_2_title')}
                </CardTitle>
                <CardDescription className="mt-2">
                  {t('recovery.scenario_2_desc')}
                </CardDescription>
              </div>
              <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/20">
                {t('recovery.your_case')}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="bg-amber-500/10 border-amber-500/20">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              <AlertTitle className="text-amber-600">{t('recovery.what_happened')}</AlertTitle>
              <AlertDescription className="text-amber-600/80">
                {t('recovery.what_happened_desc')}
              </AlertDescription>
            </Alert>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.dont_panic_title')}</h3>
                <p className="text-muted-foreground">
                  {t('recovery.dont_panic_desc_1')}<br/>
                  {t('recovery.dont_panic_desc_2')}<br/>
                  {t('recovery.dont_panic_desc_3')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.verify_org_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.verify_org_desc')}
                </p>
                <ol className="text-sm text-muted-foreground space-y-2 ml-6 list-decimal">
                  <li>{t('recovery.verify_org_step_1')}</li>
                  <li>{t('recovery.verify_org_step_2')}</li>
                  <li>{t('recovery.verify_org_step_3')}</li>
                </ol>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center font-bold text-amber-700">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.reconnect_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.reconnect_desc')}
                </p>
                
                <div className="space-y-4">
                  <div className="bg-green-500/10 rounded-lg p-4 border border-green-500/20">
                    <p className="font-semibold text-green-700 mb-2">{t('recovery.reconnect_option_a_title')}</p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>{t('recovery.reconnect_option_a_step_1')}</li>
                      <li>{t('recovery.reconnect_option_a_step_2')}</li>
                      <li>{t('recovery.reconnect_option_a_step_3')}</li>
                      <li>{t('recovery.reconnect_option_a_step_4')}</li>
                      <li>{t('recovery.reconnect_option_a_step_5')}</li>
                    </ol>
                  </div>

                  <div className="bg-blue-500/10 rounded-lg p-4 border border-blue-500/20">
                    <p className="font-semibold text-blue-700 mb-2">{t('recovery.reconnect_option_b_title')}</p>
                    <ol className="text-sm space-y-1 ml-4 list-decimal">
                      <li>{t('recovery.reconnect_option_b_step_1')}</li>
                      <li>{t('recovery.reconnect_option_b_step_2')}</li>
                      <li>{t('recovery.reconnect_option_b_step_3')}</li>
                      <li>{t('recovery.reconnect_option_b_step_4')}</li>
                      <li>{t('recovery.reconnect_option_b_step_5')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Scenario 3: Data Recovery */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <Database className="h-6 w-6 text-primary" />
              {t('recovery.scenario_3_title')}
            </CardTitle>
            <CardDescription className="mt-2">
              {t('recovery.scenario_3_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.backup_step_1_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.backup_step_1_desc')}
                </p>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => window.location.href = '/admin/system-backup'}
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  {t('recovery.go_to_backups')}
                </Button>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.backup_step_2_title')}</h3>
                <p className="text-muted-foreground">
                  {t('recovery.backup_step_2_desc')}
                </p>
              </div>
            </div>

            <Separator />

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg mb-2">{t('recovery.backup_step_3_title')}</h3>
                <p className="text-muted-foreground mb-3">
                  {t('recovery.backup_step_3_desc')}
                </p>
                <Alert className="bg-red-500/10 border-red-500/20">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertTitle className="text-red-600">{t('recovery.important_title')}</AlertTitle>
                  <AlertDescription className="text-red-600/80">
                    {t('recovery.important_desc')}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Common Problems */}
        <Card className="mb-8 border-orange-500/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-600" />
              {t('recovery.common_problems_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-2">{t('recovery.problem_1_title')}</h4>
              <p className="text-sm text-muted-foreground mb-2">{t('recovery.problem_1_desc')}</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>{t('recovery.problem_1_solution_1')}</li>
                <li>{t('recovery.problem_1_solution_2')}</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">{t('recovery.problem_2_title')}</h4>
              <p className="text-sm text-muted-foreground mb-2">{t('recovery.problem_2_desc')}</p>
              <ul className="text-sm text-muted-foreground space-y-1 ml-6 list-disc">
                <li>{t('recovery.problem_2_solution_1')}</li>
                <li>{t('recovery.problem_2_solution_2')}</li>
              </ul>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-2">{t('recovery.problem_3_title')}</h4>
              <p className="text-sm text-muted-foreground">{t('recovery.problem_3_solution')}</p>
            </div>
          </CardContent>
        </Card>

        {/* FAQ */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-primary" />
              {t('recovery.faq_title')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold mb-1">{t('recovery.faq_q1')}</h4>
              <p className="text-sm text-muted-foreground">{t('recovery.faq_a1')}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">{t('recovery.faq_q2')}</h4>
              <p className="text-sm text-muted-foreground">{t('recovery.faq_a2')}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">{t('recovery.faq_q3')}</h4>
              <p className="text-sm text-muted-foreground">{t('recovery.faq_a3')}</p>
            </div>
            <Separator />
            <div>
              <h4 className="font-semibold mb-1">{t('recovery.faq_q4')}</h4>
              <p className="text-sm text-muted-foreground">{t('recovery.faq_a4')}</p>
            </div>
          </CardContent>
        </Card>

        {/* Prevention Checklist */}
        <Card className="mb-8 border-primary/20 bg-primary/5">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              {t('recovery.prevention_title')}
            </CardTitle>
            <CardDescription>
              {t('recovery.prevention_desc')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('recovery.prevention_1')}</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('recovery.prevention_2')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('recovery.prevention_3')}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Github className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">{t('recovery.prevention_4')}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* External Access Info */}
        <Alert className="mb-8 bg-blue-500/10 border-blue-500/20">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertTitle className="text-blue-600">{t('recovery.external_access_title')}</AlertTitle>
          <AlertDescription className="text-blue-600/80 mt-2 space-y-3">
            <p>{t('recovery.external_access_desc')}</p>
            <div className="bg-blue-500/10 px-3 py-2 rounded border border-blue-500/20">
              <p className="text-xs font-medium mb-2 text-blue-600">
                {t('recovery.manual_url')}:
              </p>
              <a 
                href="https://github.com/wincovagroup/shop-evolve-pro/blob/main/RECOVERY_MANUAL.md"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs break-all block text-blue-700 hover:text-blue-900 underline font-mono"
              >
                https://github.com/wincovagroup/shop-evolve-pro/blob/main/RECOVERY_MANUAL.md
              </a>
              <Button
                variant="outline"
                size="sm"
                className="mt-3 h-8 text-xs border-blue-500/30 hover:bg-blue-500/20 text-blue-700"
                onClick={() => {
                  window.open('https://github.com/wincovagroup/shop-evolve-pro/blob/main/RECOVERY_MANUAL.md', '_blank');
                }}
              >
                <ExternalLink className="w-3 h-3 mr-2" />
                {t('recovery.open_manual')}
              </Button>
            </div>
          </AlertDescription>
        </Alert>

        {/* Emergency Contact */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertTitle>{t('recovery.need_help_title')}</AlertTitle>
          <AlertDescription className="mt-2">
            {t('recovery.need_help_desc')}
          </AlertDescription>
        </Alert>
      </div>

      {/* Image Dialog */}
      <Dialog open={imageDialog.open} onOpenChange={(open) => setImageDialog({ ...imageDialog, open })}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>{imageDialog.title}</DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <img 
              src={imageDialog.src} 
              alt={imageDialog.title}
              className="w-full h-auto rounded-lg border"
            />
          </div>
        </DialogContent>
      </Dialog>

      <Footer />
    </div>
  );
};

export default DisasterRecoveryGuide;
