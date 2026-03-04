"""Import all models so SQLModel.metadata.create_all() sees every table."""

from app.models.changelog import ChangeLog
from app.models.chapter import Chapter
from app.models.character import Character
from app.models.episode import Episode
from app.models.episode_links import EpisodeCharacter, EpisodeLocation
from app.models.faction import Faction
from app.models.location import Location
from app.models.prompt_template import PromptTemplate
from app.models.relationship import Relationship
from app.models.universe import Universe

__all__ = [
    "ChangeLog",
    "Chapter",
    "Character",
    "Episode",
    "EpisodeCharacter",
    "EpisodeLocation",
    "Faction",
    "Location",
    "PromptTemplate",
    "Relationship",
    "Universe",
]
