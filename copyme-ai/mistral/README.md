# MistralRephraser

A simple Python class to rephrase sentences using the Mistral AI API. Perfect for generating dynamic feedback

## Quick Setup

1. **Add your API key** in a `.env` file at your project root:

```
MISTRAL_API_KEY=your_mistral_api_key
```

[Grab your api key here :)](https://console.mistral.ai)

## Usage

### 1. Import and create the rephraser

```python
from mistral import MistralRephraser

rephraser = MistralRephraser()  # Uses key from .env
# or
# rephraser = MistralRephraser(api_key="your_mistral_api_key")
```

### 2. Rephrase a sentence

```python
sentence = "The cat is on the mat."
instruction = "Rephrase this sentence in a more formal way."
result = rephraser.rephrase(sentence, instruction)
print(result)
```
or with json file

```python
# Example usage:
rephraser = MistralRephraser()
feedback_json = {
    "phase": "shot_release",
    "corrections": [
        {"joint": "elbow", "correction": 20, "unit": "deg"},
        {"joint": "knee", "correction": -10, "unit": "deg"}
    ]
}
instruction = "Rephrase this feedback in a motivating and clear way for the user."
print(rephraser.rephrase(feedback_json, instruction))
```

### 3. Change the model (optional)

```python
rephraser.set_model("mistral-large-latest")
```

### 4. Check if your API key is valid

```python
if not rephraser.is_api_key_valid():
    print("Invalid API key!")
```

## Example: FastAPI Endpoint

```python
from fastapi import FastAPI, HTTPException
from mistral import MistralRephraser

app = FastAPI()
rephraser = MistralRephraser()

@app.post("/rephrase")
def rephrase_endpoint(data: dict):
    sentence = data["sentence"]
    instruction = data["instruction"]
    try:
        result = rephraser.rephrase(sentence, instruction)
        return {"result": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
```

---

**Ressource:** [https://github.com/mistralai/client-python](https://github.com/mistralai/client-python)
