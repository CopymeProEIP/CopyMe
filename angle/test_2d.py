import math

# Fonction pour calculer l'angle entre trois points en utilisant uniquement x et y
def calculate_angle_2d(pointA, pointB, pointC):
    """
    Calcule l'angle en 2D entre les segments [pointA, pointB] et [pointB, pointC].
    Utilise uniquement les coordonnées x et y.

    Arguments :
    - pointA : tuple (x, y) pour la hanche ou cheville
    - pointB : tuple (x, y) pour le genou (le point au centre)
    - pointC : tuple (x, y) pour la cheville ou hanche

    Retourne :
    - Angle en degrés entre les segments [pointA, pointB] et [pointB, pointC]
    """
    
    # Calcul des vecteurs AB et BC en 2D
    AB = (pointA[0] - pointB[0], pointA[1] - pointB[1])
    BC = (pointC[0] - pointB[0], pointC[1] - pointB[1])
    
    # Produit scalaire des vecteurs AB et BC
    dot_product = AB[0] * BC[0] + AB[1] * BC[1]
    
    # Norme (longueur) des vecteurs AB et BC
    norm_AB = math.sqrt(AB[0]**2 + AB[1]**2)
    norm_BC = math.sqrt(BC[0]**2 + BC[1]**2)
    
    # Calcul de l'angle en radians
    cos_theta = dot_product / (norm_AB * norm_BC)
    
    # Limite cos_theta pour éviter les erreurs d'arrondi hors de [-1, 1]
    cos_theta = max(-1.0, min(1.0, cos_theta))
    
    # Conversion de l'angle en degrés
    angle = math.degrees(math.acos(cos_theta))
    
    return angle


# Coordonnées des points extraites de MediaPipe (exemple)
left_hip = (102, 156)     # Remplace avec les coordonnées réelles de MediaPipe (x, y)
left_knee = (95, 166)    # Remplace avec les coordonnées réelles de MediaPipe (x, y)
left_ankle = (102, 168)   # Remplace avec les coordonnées réelles de MediaPipe (x, y)

# Calcul de l'angle de flexion du genou gauche en 2D (en utilisant x et y)
angle_knee_2d = calculate_angle_2d(left_hip, left_knee, left_ankle)
print("Angle de flexion du genou gauche (2D) :", angle_knee_2d)
