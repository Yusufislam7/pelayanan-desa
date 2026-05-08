const crypto = require('crypto');
const requestService = require('../services/requestService');
const uploadService = require('../services/uploadService');

function validateRequestBody(body) {
  const name = String(body.name || '').trim();
  const serviceType = String(body.serviceType || '').trim();
  const description = String(body.description || '').trim();

  if (!name || !description) {
    const error = new Error('Nama dan keterangan wajib diisi.');
    error.status = 400;
    throw error;
  }

  return {
    name,
    serviceType: serviceType || 'Surat Keterangan',
    description,
  };
}

function extractS3KeyFromUrl(url) {
  if (!url) return null;
  // For CloudFront URLs: https://domain.cloudfront.net/uploads/key
  if (url.includes('cloudfront.net')) {
    const urlParts = url.split('/');
    return urlParts.slice(-2).join('/'); // uploads/filename
  }
  // For S3 URLs: https://bucket.s3.region.amazonaws.com/key
  const match = url.match(/\/([^\/]+\.s3[^\/]*\.amazonaws\.com\/)(.+)/);
  if (match && match[2]) return match[2];
  // Fallback
  const urlParts = url.split('/');
  return urlParts.slice(-2).join('/');
}

async function getRequests(req, res, next) {
  try {
    const query = String(req.query.q || '').trim();
    const requests = await requestService.findAll(query);
    res.json(requests);
  } catch (error) {
    next(error);
  }
}

async function createRequest(req, res, next) {
  try {
    const { name, serviceType, description } = validateRequestBody(req.body);
    let fileUrl = null;

    if (req.file) {
      const uploadedFile = await uploadService.uploadToS3(req.file);
      fileUrl = uploadedFile.url;
    }

    const request = {
      id: crypto.randomUUID(),
      name,
      serviceType,
      description,
      status: 'Menunggu Proses',
      fileUrl,
      createdAt: new Date(),
    };

    const created = await requestService.createRequest(request);
    res.status(201).json(created);
  } catch (error) {
    next(error);
  }
}

async function updateRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const existing = await requestService.findById(requestId);
    if (!existing) {
      const error = new Error('Pengajuan tidak ditemukan.');
      error.status = 404;
      throw error;
    }

    const { name, serviceType, description } = validateRequestBody(req.body);
    const status = String(req.body.status || existing.status).trim() || existing.status;
    let fileUrl = existing.fileUrl;

    if (req.file) {
      if (existing.fileUrl) {
        const oldS3Key = extractS3KeyFromUrl(existing.fileUrl);
        await uploadService.deleteFromS3(oldS3Key);
      }

      const uploadedFile = await uploadService.uploadToS3(req.file);
      fileUrl = uploadedFile.url;
    }

    const updated = await requestService.updateRequest(requestId, {
      name,
      serviceType,
      description,
      status,
      fileUrl,
    });

    res.json(updated);
  } catch (error) {
    next(error);
  }
}

async function deleteRequest(req, res, next) {
  try {
    const requestId = req.params.id;
    const existing = await requestService.findById(requestId);
    if (!existing) {
      const error = new Error('Pengajuan tidak ditemukan.');
      error.status = 404;
      throw error;
    }

    if (existing.fileUrl) {
      const s3Key = extractS3KeyFromUrl(existing.fileUrl);
      await uploadService.deleteFromS3(s3Key);
    }

    const deleted = await requestService.deleteRequest(requestId);
    if (!deleted) {
      const error = new Error('Gagal menghapus pengajuan.');
      error.status = 500;
      throw error;
    }

    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getRequests,
  createRequest,
  updateRequest,
  deleteRequest,
};
