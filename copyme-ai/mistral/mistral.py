from mistralai import Mistral, models
import os
from dotenv import load_dotenv

load_dotenv()

class MistralRephraser:
    def __init__(self, api_key: str = None, model: str = "mistral-small-latest"):
        self.api_key = api_key or os.getenv("MISTRAL_API_KEY")
        if not self.api_key:
            raise ValueError("The Mistral API key is not defined. Add MISTRAL_API_KEY in your .env file.")
        self.model = model
        self.client = Mistral(api_key=self.api_key)

    def rephrase(self, original_sentence: str, instruction: str) -> str:
        """
        Rephrase a sentence according to a given instruction.
        :param original_sentence: The sentence to rephrase.
        :param instruction: The rephrasing instruction (e.g., 'Make the sentence more motivating').
        :return: The rephrased sentence.
        """
        messages = [
            {"role": "system", "content": instruction},
            {"role": "user", "content": original_sentence}
        ]
        try:
            response = self.client.chat.complete(
                model=self.model,
                messages=messages
            )
            return response.choices[0].message.content.strip()
        except models.SDKError as e:
            raise RuntimeError(f"Mistral API error: {e.message}") from e
        except Exception as e:
            raise RuntimeError(f"Unexpected error: {str(e)}") from e

    def set_model(self, model: str):
        """
        Change the model used (e.g., 'mistral-large-latest').
        """
        self.model = model

    def is_api_key_valid(self) -> bool:
        """
        Check if the API key is valid (by listing the models).
        """
        try:
            self.client.models.list()
            return True
        except Exception:
            return False
