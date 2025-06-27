import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

interface FileContent {
  name: string;
  content: string;
  error?: string;
}

export async function POST(request: NextRequest) {
  try {
    const { gameFileLocation } = await request.json();
    
    if (!gameFileLocation) {
      return NextResponse.json({ files: [] });
    }

    // Check if it's a URL or local path
    if (gameFileLocation.startsWith('http://') || gameFileLocation.startsWith('https://')) {
      // For URLs, we'll need to fetch the directory listing
      // This is a simplified version - in production you'd need proper URL handling
      return NextResponse.json({ 
        files: [], 
        error: 'URL-based file locations require server configuration' 
      });
    }

    // Handle local file paths
    try {
      const stats = await fs.stat(gameFileLocation);
      
      if (!stats.isDirectory()) {
        return NextResponse.json({ 
          files: [], 
          error: 'Path is not a directory' 
        });
      }

      // Read all files in the directory
      const dirContents = await fs.readdir(gameFileLocation);
      
      // Filter for .txt files
      const txtFiles = dirContents.filter(file => 
        file.toLowerCase().endsWith('.txt')
      );

      // Read content of each txt file
      const fileContents: FileContent[] = await Promise.all(
        txtFiles.map(async (fileName) => {
          try {
            const filePath = path.join(gameFileLocation, fileName);
            const content = await fs.readFile(filePath, 'utf-8');
            return {
              name: fileName,
              content: content
            };
          } catch (error) {
            return {
              name: fileName,
              content: '',
              error: `Failed to read file: ${error}`
            };
          }
        })
      );

      return NextResponse.json({ files: fileContents });
      
    } catch (error) {
      return NextResponse.json({ 
        files: [], 
        error: `Failed to access directory: ${error}` 
      });
    }
    
  } catch (error) {
    console.error('Error processing game files:', error);
    return NextResponse.json({ 
      files: [], 
      error: 'Invalid request' 
    }, { status: 400 });
  }
}