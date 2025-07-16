import { PropsWithChildren } from 'react';
import { Box } from '@mantine/core';

export const PageContainer: React.FC<PropsWithChildren> = ({ children }) => {
  return (
    <main>
      <Box component="div" p="xl">
        {children}
      </Box>
    </main>
  );
};
