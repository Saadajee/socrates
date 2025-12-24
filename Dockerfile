FROM mambaorg/micromamba:1.5.8

# Install system deps + git
USER root
RUN apt-get update && apt-get install -y curl git && rm -rf /var/lib/apt/lists/*

# Create app dir
WORKDIR /app

# Copy environment.yml (we'll create this in 10 seconds)
COPY environment.yml .

# Create conda env with micromamba (bypasses broken pip)
RUN micromamba install -y -n base -f environment.yml && \
    micromamba clean --all --yes

# Make python from conda the default
ENV PATH="/opt/conda/bin:$PATH"

# Copy startup script
COPY startup.sh .
RUN chmod +x startup.sh

EXPOSE 8000

CMD ["./startup.sh"]
