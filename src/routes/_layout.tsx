import { MainLayout } from '@/components/layouts/main-layout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/_layout')({
  component: MainLayout,
});
