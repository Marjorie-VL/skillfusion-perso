import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadController = {
  // Upload d'un fichier
  async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      // Retourner l'URL du fichier uploadé
      const fileUrl = `/uploads/${req.file.filename}`;
      
      return res.status(200).json({
        message: 'Fichier uploadé avec succès',
        filename: req.file.filename,
        originalName: req.file.originalname,
        url: fileUrl,
        size: req.file.size
      });
    } catch (error) {
      console.error('❌ Erreur upload →', error.message);
      return res.status(500).json({ error: 'Erreur lors de l\'upload du fichier' });
    }
  },

  // Upload de plusieurs fichiers
  async uploadMultipleFiles(req, res) {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'Aucun fichier fourni' });
      }

      const uploadedFiles = req.files.map(file => ({
        filename: file.filename,
        originalName: file.originalname,
        url: `/uploads/${file.filename}`,
        size: file.size
      }));

      return res.status(200).json({
        message: 'Fichiers uploadés avec succès',
        files: uploadedFiles
      });
    } catch (error) {
      console.error('❌ Erreur upload multiple →', error.message);
      return res.status(500).json({ error: 'Erreur lors de l\'upload des fichiers' });
    }
  }
};

export { uploadController };
