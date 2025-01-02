const express = require('express');
const router = express.Router();
const Form = require('../schemas/form.schema');
const {authMiddleware} = require('../middlewares/auth');

// Create a new form
router.post('/', authMiddleware, async (req, res) => {
    try {
        const owner = req.user;
        const { name, workspaceId, folderId} = req.body;

        if (!name || !workspaceId) {
            return res.status(400).json({ message: 'All fields are required.'});
        }

        const alreadyExists = await Form.findOne({ name, workspace: workspaceId });
        if (alreadyExists) {
            return res.status(400).json({ message: 'Form with the same name already exists.'});
        }

        const newForm = new Form({
            name,
            workspace: workspaceId,
            folder: folderId,
            owner,
        });

        await newForm.save();
        res.status(200).json({ message: 'Form created successfully.', form: newForm });
    } catch (error) {
        res.status(500).json({ message: 'Error creating form.', error: error.message });
    }
});

router.get('/:workspaceId/:folderId', authMiddleware, async (req, res) => {
    try {
        const { workspaceId, folderId } = req.params;

        if(!workspaceId) {
            return res.status(400).json({ message: 'Workspace ID is required.'});
        }
        const forms = await Form.find({
            workspace: workspaceId,
            folder: folderId != "root" ? folderId : { $exists: false },
        });        
        res.status(200).json({ forms });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching forms.', error: error.message });
    }
});

//get form by id
router.get('/:formId', authMiddleware, async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found.' });
        }
        res.status(200).json({ form });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching form.', error: error.message });
    }
})

//get form by id
router.get('/public/share/access/:formId', async (req, res) => {
    try {
        const { formId } = req.params;
        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found.' });
        }
        form.viewCount += 1;
        
        await form.save();
        res.status(200).json({ form });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching form.', error: error.message });
    }
})

// Delete a form
router.delete('/:formId', authMiddleware, async (req, res) => {
    try {
        const { formId } = req.params;

        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found.' });
        }

        await Form.deleteOne({ _id: formId });
        res.status(200).json({ message: 'Form deleted successfully.'});
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: 'Error deleting form.', error: error.message });
    }
});

// Update form data
router.put('/:formId', authMiddleware, async (req, res) => {
    try {
        const { formId } = req.params;
        const { data, name } = req.body;
        const updatedForm = await Form.findByIdAndUpdate(
            formId,
            { formData: data, name: name },
            { new: true }
        );

        if (!updatedForm) {
            return res.status(404).json({ message: 'Form not found.' });
        }

        res.status(200).json({ message: 'Form updated successfully.', form: updatedForm });
    } catch (error) {
        res.status(500).json({ message: 'Error updating form.', error: error.message });
    }
});

// Collect user response
router.post('/:formId/response', async (req, res) => {
    try {
        const { formId } = req.params;
        const { data } = req.body;

        const form = await Form.findById(formId);
        if (!form) {
            return res.status(404).json({ message: 'Form not found.' });
        }

        if (!Array.isArray(form.formResponse)) {
            form.formResponse = [];
        }

        const responseWithTime = {
            ...data,
            submittedAt: new Date(),
        };

        form.formResponse.push(responseWithTime);
        form.submitCount += 1;

        await form.save();
        res.status(200).json({ message: 'Response collected successfully.', form });
    } catch (error) {
        res.status(500).json({ message: 'Error collecting response.', error: error.message });
    }
});

module.exports = router;
