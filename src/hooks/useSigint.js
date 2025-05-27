
import { useMutation } from '@tanstack/react-query';
import { sigintApi } from '../api/threats.ts';
import { useToast } from '@/hooks/use-toast';

export const useSigintControls = () => {
  const { toast } = useToast();

  const rssScrapeMutation = useMutation({
    mutationFn: sigintApi.testRssScrape,
    onSuccess: (data) => {
      toast({
        title: "RSS Scraper Triggered",
        description: `Processed ${data.data?.count || 0} RSS feeds`,
      });
    },
    onError: () => {
      toast({
        title: "RSS Scraper Failed",
        description: "Check SIGINT server connection",
        variant: "destructive",
      });
    },
  });

  const apiScrapeMutation = useMutation({
    mutationFn: sigintApi.testApiScrape,
    onSuccess: (data) => {
      toast({
        title: "API Scraper Triggered",
        description: `Processed ${data.data?.count || 0} API sources`,
      });
    },
    onError: () => {
      toast({
        title: "API Scraper Failed",
        description: "Check SIGINT server connection",
        variant: "destructive",
      });
    },
  });

  const htmlScrapeMutation = useMutation({
    mutationFn: sigintApi.testHtmlScrape,
    onSuccess: (data) => {
      toast({
        title: "HTML Scraper Triggered",
        description: `Processed ${data.data?.count || 0} HTML sources`,
      });
    },
    onError: () => {
      toast({
        title: "HTML Scraper Failed",
        description: "Check SIGINT server connection",
        variant: "destructive",
      });
    },
  });

  const redditScrapeMutation = useMutation({
    mutationFn: sigintApi.testRedditScrape,
    onSuccess: (data) => {
      toast({
        title: "Reddit Scraper Triggered",
        description: `Processed ${data.data?.count || 0} Reddit posts`,
      });
    },
    onError: () => {
      toast({
        title: "Reddit Scraper Failed",
        description: "Check SIGINT server connection",
        variant: "destructive",
      });
    },
  });

  return {
    triggerRssScrape: rssScrapeMutation.mutate,
    triggerApiScrape: apiScrapeMutation.mutate,
    triggerHtmlScrape: htmlScrapeMutation.mutate,
    triggerRedditScrape: redditScrapeMutation.mutate,
    isLoading: rssScrapeMutation.isPending || apiScrapeMutation.isPending || 
               htmlScrapeMutation.isPending || redditScrapeMutation.isPending,
  };
};
