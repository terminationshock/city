#!/usr/bin/env python

import pygame
from pygame.locals import *
from glob import glob

pygame.init()
pygame.display.set_mode((100, 100), FULLSCREEN | HWSURFACE | DOUBLEBUF)

for img in glob('img/?????.png'):
    imagefile = pygame.image.load(img)
    width, height = imagefile.get_size()

    surf = pygame.Surface((width, height-20)).convert_alpha()
    surf.fill((255,255,255,0))
    surf.blit(imagefile, (0,0))

    y = height - 94
    poly = [(0, y+37), (0, height), (width, height), (128, y+37), (64, y+74)]

    pygame.draw.polygon(surf, (255,255,255,0), poly)

    pygame.image.save(surf, img.replace('img', 'img2'))
