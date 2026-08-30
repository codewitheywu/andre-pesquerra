<?php
require_once __DIR__ . '/../includes/config.php';
require_once __DIR__ . '/../includes/auth.php';
require_once __DIR__ . '/../includes/layout.php';
requireLogin();

$db = getDB();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrf_verify();
    $action = $_POST['_action'] ?? '';

    try {
        if ($action === 'update_status') {
            $id     = (int)($_POST['id'] ?? 0);
            $status = in_array($_POST['status'] ?? '', ['unread','read','archived'], true) ? $_POST['status'] : 'read';
            $db->prepare("UPDATE contact_messages SET status=? WHERE id=?")->execute([$status, $id]);
            header('Location: messages.php'); exit;
        }

        if ($action === 'delete') {
            $db->prepare("DELETE FROM contact_messages WHERE id=?")->execute([(int)($_POST['id'] ?? 0)]);
            setFlash('success', 'Message deleted.');
            header('Location: messages.php'); exit;
        }

        if ($action === 'bulk_archive') {
            $db->exec("UPDATE contact_messages SET status='archived' WHERE status='read'");
            setFlash('success', 'Read messages archived.');
            header('Location: messages.php'); exit;
        }
    } catch (PDOException $e) {
        setFlash('error', 'Action failed — please try again.');
        header('Location: messages.php'); exit;
    }
}

// Mark opened message as read
$viewing = null;
if (isset($_GET['view'])) {
    $s = $db->prepare("SELECT * FROM contact_messages WHERE id=?");
    $s->execute([(int)$_GET['view']]);
    $viewing = $s->fetch();
    if ($viewing && $viewing['status'] === 'unread') {
        $db->prepare("UPDATE contact_messages SET status='read' WHERE id=?")->execute([$viewing['id']]);
        $viewing['status'] = 'read';
    }
}

$filter   = $_GET['filter'] ?? 'all';
$whereMap = ['all' => '', 'unread' => "WHERE status='unread'", 'read' => "WHERE status='read'", 'archived' => "WHERE status='archived'"];
$where    = $whereMap[$filter] ?? '';
$messages = $db->query("SELECT * FROM contact_messages $where ORDER BY sent_at DESC")->fetchAll();

$counts = $db->query(
    "SELECT status, COUNT(*) as n FROM contact_messages GROUP BY status"
)->fetchAll(PDO::FETCH_KEY_PAIR);

cmsHead('Messages');
?>

<div id="messages-layout" style="display:flex;gap:1.5rem;align-items:stretch;flex-wrap:wrap;">

  <!-- Inbox list -->
  <div class="card" style="flex:1;min-width:280px;">
    <div class="card-head">
      <h2 class="card-title">Inbox</h2>
      <form method="POST" style="display:inline;">
        <?= csrf_field() ?>
        <input type="hidden" name="_action" value="bulk_archive">
        <button type="submit" class="btn-sm" onclick="return confirm('Archive all read messages?')">
          Archive Read
        </button>
      </form>
    </div>

    <!-- Filter tabs -->
    <div style="display:flex;gap:0;border-bottom:1px solid var(--border);margin-bottom:1rem;">
      <?php foreach (['all'=>'All','unread'=>'Unread','read'=>'Read','archived'=>'Archived'] as $k=>$label): ?>
      <a href="?filter=<?= $k ?>"
         style="padding:0.5rem 1rem;font-size:0.72rem;letter-spacing:0.1em;text-transform:uppercase;
                color:<?= $filter===$k ? 'var(--gold)' : 'var(--text-muted)' ?>;
                border-bottom:<?= $filter===$k ? '1px solid var(--gold)' : '1px solid transparent' ?>;
                margin-bottom:-1px;transition:color 0.2s;">
        <?= $label ?>
        <?php if (isset($counts[$k])): ?>
        <span style="font-size:0.65rem;background:var(--surface);padding:0 4px;border-radius:8px;margin-left:3px;">
          <?= (int)$counts[$k] ?>
        </span>
        <?php endif; ?>
      </a>
      <?php endforeach; ?>
    </div>

    <?php if ($messages): ?>
    <div style="display:flex;flex-direction:column;gap:0;">
      <?php foreach ($messages as $m): ?>
      <?php $isActive = $viewing && $viewing['id'] === $m['id']; ?>
      <a href="?view=<?= $m['id'] ?>&filter=<?= htmlspecialchars($filter, ENT_QUOTES, 'UTF-8') ?>"
         style="display:block;padding:1rem;border-radius:4px;margin-bottom:2px;
                background:<?= $isActive ? 'var(--surface)' : 'transparent' ?>;
                border-left:2px solid <?= $m['status']==='unread' ? 'var(--gold)' : 'transparent' ?>;
                transition:background 0.2s;">
        <div style="display:flex;justify-content:space-between;align-items:baseline;gap:0.5rem;">
          <p style="font-size:0.85rem;font-weight:<?= $m['status']==='unread' ? '500' : '400' ?>;
                    color:var(--text-1);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            <?= htmlspecialchars($m['name']) ?>
          </p>
          <p style="font-size:0.65rem;color:var(--text-muted);flex-shrink:0;">
            <?= date('M j', strtotime($m['sent_at'])) ?>
          </p>
        </div>
        <p style="font-size:0.78rem;color:var(--text-muted);margin-top:0.15rem;
                  white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          <?= htmlspecialchars($m['subject'] ?? '(no subject)') ?>
        </p>
      </a>
      <?php endforeach; ?>
    </div>
    <?php else: ?>
    <p class="empty-state">No messages here.</p>
    <?php endif; ?>
  </div>

  <!-- Message detail -->
  <div class="card" style="flex:2;min-width:300px;">
    <?php if ($viewing): ?>
    <div class="card-head">
      <h2 class="card-title" style="font-size:1rem;">
        <?= htmlspecialchars($viewing['subject'] ?? '(no subject)') ?>
      </h2>
      <span class="status-pill status-<?= htmlspecialchars($viewing['status'], ENT_QUOTES, 'UTF-8') ?>"><?= htmlspecialchars($viewing['status'], ENT_QUOTES, 'UTF-8') ?></span>
    </div>

    <div style="margin-bottom:1.5rem;padding-bottom:1rem;border-bottom:1px solid var(--border);">
      <p style="font-size:0.88rem;color:var(--text-1);font-weight:500;">
        <?= htmlspecialchars($viewing['name']) ?>
        <span style="font-weight:300;color:var(--text-muted);">&lt;<?= htmlspecialchars($viewing['email']) ?>&gt;</span>
      </p>
      <p style="font-size:0.72rem;color:var(--text-muted);margin-top:0.25rem;">
        <?= date('F j, Y · g:i A', strtotime($viewing['sent_at'])) ?>
      </p>
    </div>

    <div style="font-size:0.9rem;color:var(--text-2);line-height:1.8;white-space:pre-wrap;margin-bottom:2rem;">
<?= htmlspecialchars($viewing['message']) ?>
    </div>

    <?php
      $replySubject = 'Re: ' . ($viewing['subject'] ?? '');
      // mailto: links only do something if the OS/browser has a default mail app
      // registered, which very often isn't the case (e.g. no Outlook installed).
      // Gmail's web-compose URL opens directly in the browser instead, so it works
      // regardless of that setting as long as you're signed into Gmail there.
      $gmailComposeUrl = 'https://mail.google.com/mail/?view=cm&fs=1'
        . '&to=' . rawurlencode($viewing['email'])
        . '&su=' . rawurlencode($replySubject);
    ?>
    <div style="display:flex;gap:0.75rem;flex-wrap:wrap;">
      <a href="<?= htmlspecialchars($gmailComposeUrl, ENT_QUOTES, 'UTF-8') ?>"
         class="btn-primary" target="_blank" rel="noopener">Reply via Gmail</a>

      <a href="mailto:<?= htmlspecialchars($viewing['email'], ENT_QUOTES, 'UTF-8') ?>?subject=<?= rawurlencode($replySubject) ?>"
         class="btn-sm">Default Mail App</a>

      <button type="button" class="btn-sm js-copy-email"
              data-email="<?= htmlspecialchars($viewing['email'], ENT_QUOTES, 'UTF-8') ?>">
        Copy Email
      </button>

      <form method="POST" style="display:inline;">
        <?= csrf_field() ?>
        <input type="hidden" name="_action" value="update_status">
        <input type="hidden" name="id" value="<?= $viewing['id'] ?>">
        <input type="hidden" name="status" value="archived">
        <button type="submit" class="btn-sm">Archive</button>
      </form>

      <form method="POST" style="display:inline;">
        <?= csrf_field() ?>
        <input type="hidden" name="_action" value="delete">
        <input type="hidden" name="id" value="<?= $viewing['id'] ?>">
        <button type="submit" class="btn-danger-sm"
                onclick="return confirm('Permanently delete this message?')">Delete</button>
      </form>
    </div>

    <?php else: ?>
    <div class="empty-state" style="padding:4rem 2rem;text-align:center;">
      <svg viewBox="0 0 24 24" style="width:40px;height:40px;stroke:var(--border);fill:none;stroke-width:1;margin:0 auto 1rem;">
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
        <polyline points="22,6 12,13 2,6"/>
      </svg>
      <p>Select a message to read it</p>
    </div>
    <?php endif; ?>
  </div>

</div>

<?php cmsFoot(); ?>
