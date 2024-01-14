# set base image (host OS)
FROM python:3.10-bookworm

# set the working directory in the container
WORKDIR /code
COPY . /code
COPY pip.conf /etc/pip.conf

# Install dependencies from the requirements file
RUN pip install -r "requirements.new" && rm /etc/pip.conf

# Create a non-root user and switch to it
RUN useradd -u 1001 -m appuser
USER 1001

# Expose the port the app runs on
EXPOSE 8080

# Run the Flask app using the built-in server
CMD ["python", "src/server.py"]

