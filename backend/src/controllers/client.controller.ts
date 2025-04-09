import { Request, Response } from 'express';
import Client, { IClient } from '../models/Client';

// Récupérer tous les clients
export const getAllClients = async (req: Request, res: Response) => {
  try {
    const clients = await Client.find();
    
    return res.status(200).json({
      success: true,
      count: clients.length,
      data: clients
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des clients',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Récupérer un client par son ID
export const getClientById = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération du client',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Créer un nouveau client
export const createClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, address, notes } = req.body;
    
    const existingClient = await Client.findOne({ email });
    if (existingClient) {
      return res.status(400).json({
        success: false,
        message: 'Un client avec cet email existe déjà'
      });
    }
    
    const client = await Client.create({
      firstName,
      lastName,
      email,
      phone,
      address,
      notes
    });
    
    return res.status(201).json({
      success: true,
      data: client
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la création du client',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Mettre à jour un client
export const updateClient = async (req: Request, res: Response) => {
  try {
    const { firstName, lastName, email, phone, address, notes } = req.body;
    
    // Vérifier si le client existe
    let client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    // Vérifier si l'email existe déjà pour un autre client
    if (email && email !== client.email) {
      const existingClient = await Client.findOne({ email });
      if (existingClient && existingClient._id.toString() !== req.params.id) {
        return res.status(400).json({
          success: false,
          message: 'Un client avec cet email existe déjà'
        });
      }
    }
    
    // Mettre à jour le client
    client = await Client.findByIdAndUpdate(
      req.params.id,
      {
        firstName,
        lastName,
        email,
        phone,
        address,
        notes
      },
      { new: true, runValidators: true }
    );
    
    return res.status(200).json({
      success: true,
      data: client
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la mise à jour du client',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
};

// Supprimer un client
export const deleteClient = async (req: Request, res: Response) => {
  try {
    const client = await Client.findById(req.params.id);
    
    if (!client) {
      return res.status(404).json({
        success: false,
        message: 'Client non trouvé'
      });
    }
    
    await Client.findByIdAndDelete(req.params.id);
    
    return res.status(200).json({
      success: true,
      message: 'Client supprimé avec succès'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du client',
      error: error instanceof Error ? error.message : 'Erreur inconnue'
    });
  }
}; 